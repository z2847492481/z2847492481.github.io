# 创建 Controller-Service-Repository 三层结构的 ASP.NET Core Web 程序(PostgreSQL)

本文档记录使用 .NET CLI 创建一个三层架构(Controller → Service → Repository)Web API 的完整步骤,数据库使用 PostgreSQL,ORM 使用 EF Core。以实现 `GET /user/{id}` 查询用户接口为例。

## 架构与数据流

```
HTTP 请求 GET /user/{id}
      ↓
UserController      路由处理,负责 HTTP 语义(200/404)
      ↓
UserService         业务逻辑层
      ↓
UserRepository      数据访问层
      ↓
AppDbContext        EF Core 枢纽:User 实体 ↔ users 表
      ↓
PostgreSQL
```

## 环境要求

- .NET SDK
- PostgreSQL 数据库(本文假设库已创建,账号 postgres / 密码 123456)

## 步骤一:创建项目并安装 NuGet 包

```bash
dotnet new web -o Test1
cd Test1

# PostgreSQL 的 EF Core 驱动
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
# snake_case 命名约定(Npgsql 9+ 已移除内置支持,必须单独安装)
dotnet add package EFCore.NamingConventions
# EF 迁移工具支持(使用 dotnet ef 命令时需要)
dotnet add package Microsoft.EntityFrameworkCore.Design
```

## 步骤二:配置连接字符串

编辑 `appsettings.json`,`ConnectionStrings` 必须是一个**对象**而非字符串:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "AppDbContext": "Host=localhost;Port=5432;Database=test1;Username=postgres;Password=123456"
  }
}
```

`GetConnectionString("AppDbContext")` 读取的就是 `ConnectionStrings:AppDbContext` 这个配置路径。

## 步骤三:创建实体 Models/User.cs

```csharp
namespace Test1.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
```

注意:必须是 **public 属性(property,带 `{ get; set; }`)**,不能写成私有字段,否则 EF Core 不映射、JSON 也不序列化。启用 Nullable 时 string 属性建议初始化为 `string.Empty`。

## 步骤四:创建 DbContext(Data/AppDbContext.cs)

```csharp
using Microsoft.EntityFrameworkCore;
using Test1.Models;

namespace Test1.Data;

public class AppDbContext : DbContext
{
    public DbSet<User> Users { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
}
```

两个关键点:

- `DbSet<User> Users` 必须是 **public**,代表 users 表
- 构造函数必须用 `: base(options)` 把配置传给基类

## 步骤五:创建 Repository 层

接口 `Repositories/IUserRepository.cs`:

```csharp
using Test1.Models;

namespace Test1.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
}
```

实现 `Repositories/UserRepository.cs`:

```csharp
using Test1.Data;
using Test1.Models;

namespace Test1.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int id) => await _context.Users.FindAsync(id);
}
```

`FindAsync` 是按主键查询,返回 `ValueTask<User?>`,查不到时为 null。

## 步骤六:创建 Service 层

接口 `Services/IUserService.cs`:

```csharp
using Test1.Models;

namespace Test1.Services;

public interface IUserService
{
    Task<User?> GetByIdAsync(int id);
}
```

实现 `Services/UserService.cs`:

```csharp
using Test1.Models;
using Test1.Repositories;

namespace Test1.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repository;

    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }

    public async Task<User?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);
}
```

## 步骤七:创建 Controller(Controllers/UserController.cs)

```csharp
using Microsoft.AspNetCore.Mvc;
using Test1.Models;
using Test1.Services;

namespace Test1.Controllers;

[ApiController]
[Route("user")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetByIdAsync(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        return user;
    }
}
```

要点:

- `[Route("user")]` + `[HttpGet("{id}")]` 组合出路径 `/user/{id}`
- Controller 返回类型用 `Task<ActionResult<User>>`:既能返回数据(200 + JSON),也能返回 HTTP 状态码(404)
- Service/Repository 返回 `Task<User?>`,只负责数据;Controller 负责把"查不到"翻译成 HTTP 语义

## 步骤八:注册服务(Program.cs)

```csharp
using Microsoft.EntityFrameworkCore;
using Test1.Data;
using Test1.Repositories;
using Test1.Services;

var builder = WebApplication.CreateBuilder(args);

// Controller 自动扫描注册
builder.Services.AddControllers();
// 注册 DbContext,启用 snake_case 命名约定
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(
    builder.Configuration.GetConnectionString("AppDbContext")
).UseSnakeCaseNamingConvention());
// Repository 和 Service 必须显式逐个注册
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

app.MapControllers();

app.Run();
```

DI 注册规则:

- Controller:由 `AddControllers()` 反射自动扫描,无需手动注册
- Service / Repository:每新增一个就要手写一行 `AddScoped<I接口, 实现>()`
- `AddScoped` 表示每个 HTTP 请求一个实例(对应 Spring 的 request 作用域)

## 步骤九:创建数据库表

PostgreSQL 中执行建表语句(列名使用小写):

```sql
create table users
(
    id    integer generated always as identity primary key,
    name  varchar(100) not null,
    email varchar(255) not null
);

insert into users (name, email) values ('Alice', 'alice@test.com');
```

> 也可用 EF 迁移代替手动建表:
> ```bash
> dotnet tool install --global dotnet-ef   # 首次使用需安装工具
> dotnet ef migrations add InitialCreate
> dotnet ef database update
> ```

## 步骤十:运行与验证

```bash
dotnet run
```

访问:

```
http://localhost:5000/user/1
```

返回:

```json
{"id":1,"name":"Alice","email":"alice@test.com"}
```

访问不存在的 id(如 `/user/999`)返回 404。

## 关键注意事项(踩坑记录)

### 1. PostgreSQL 标识符大小写问题

PostgreSQL 对不带引号的标识符折叠为小写,而 EF Core 生成 SQL 时默认用双引号保留 C# 的 PascalCase(`"Users"`、`"Id"`)。两者不匹配会报错 `relation "Users" does not exist`。

解决方案就是安装 `EFCore.NamingConventions` 并调用 `UseSnakeCaseNamingConvention()`,使生成的 SQL 自动使用 `users`、`id`、`name`、`email`。

> 注意:Npgsql 9/10 已移除内置的该方法,必须安装独立包,且写法是链式调用 `UseNpgsql(...).UseSnakeCaseNamingConvention()`,不是写在 Npgsql 的 lambda 参数里。

### 2. 全链路异步

数据库 IO 操作必须全链路 async/await,方法名以 `Async` 结尾时返回类型必须是 `Task<T>` 或 `ValueTask<T>`:

- 错误:`public User GetByIdAsync(int id) => _context.Users.FindAsync(id);`(类型不匹配)
- 正确:`public async Task<User?> GetByIdAsync(int id) => await _context.Users.FindAsync(id);`

### 3. 依赖文件

项目依赖看 `Test1.csproj` 的 `<PackageReference>` 节点(类似 Maven 的 pom.xml),传递依赖可用以下命令查看:

```bash
dotnet list package
```

## 最终目录结构

```
Test1/
├── Controllers/
│   └── UserController.cs
├── Services/
│   ├── IUserService.cs
│   └── UserService.cs
├── Repositories/
│   ├── IUserRepository.cs
│   └── UserRepository.cs
├── Data/
│   └── AppDbContext.cs
├── Models/
│   └── User.cs
├── Program.cs
├── appsettings.json
└── Test1.csproj
```
