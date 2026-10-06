# 创建最小的 ASP.NET Core HelloWorld Web 程序

本文档记录使用 .NET CLI 从零创建一个最小化 ASP.NET Core Web 程序的完整步骤。

## 环境要求

- 已安装 .NET SDK(本文基于 .NET 10,其他版本步骤相同)
- 检查安装:

```bash
dotnet --version
```

## 步骤一:创建 Web 项目

```bash
dotnet new web -o HelloWorld
```

- `dotnet new`:创建项目的命令
- `web`:最小化空 Web 项目模板(只含启动入口,不带 MVC/Razor 脚手架)
- `-o HelloWorld`:指定输出目录名,同时作为项目名

生成的关键文件:

- `HelloWorld.csproj` — 项目文件(类似 Maven 的 pom.xml)
- `Program.cs` — 程序入口
- `Properties/launchSettings.json` — 启动端口等配置

## 步骤二:进入项目目录

```bash
cd HelloWorld
```

后续所有 dotnet 命令都需要在项目目录下执行。

## 步骤三:编写 Program.cs

用编辑器打开 `Program.cs`,写入以下内容:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
```

代码说明:

- `WebApplication.CreateBuilder(args)`:初始化 Web 应用主机
- `app.MapGet("/", ...)`:把 HTTP `GET /` 请求映射到返回 `"Hello World!"` 的处理函数
- `app.Run()`:启动应用并监听 HTTP 请求

## 步骤四:构建并运行

```bash
dotnet run
```

该命令会自动完成:还原依赖 → 编译 → 启动 Kestrel 服务器。

启动成功后控制台输出类似:

```
Now listening on: http://localhost:5000
```

> 首次运行较慢,因为需要还原 NuGet 包。

## 步骤五:浏览器验证

打开浏览器访问:

```
http://localhost:5000
```

页面显示 `Hello World!` 即成功。

按 `Ctrl + C` 停止应用。

## 常用补充命令

| 命令 | 作用 |
|---|---|
| `dotnet new list` | 查看所有可用项目模板 |
| `dotnet build` | 仅编译,不运行 |
| `dotnet watch run` | 热重载:代码改动后自动重启 |
| `dotnet new webapi -o MyApi` | 创建带控制器的 Web API 项目 |
| `dotnet new mvc -o MyMvc` | 创建 MVC 项目(含视图) |

## 排错速查

- **端口被占用**:修改 `Properties/launchSettings.json` 中的 `applicationUrl`
- **页面无响应**:确认控制台显示 `Now listening on`,且访问的端口与之一致
- **依赖还原失败**:检查网络,或执行 `dotnet restore` 单独还原
