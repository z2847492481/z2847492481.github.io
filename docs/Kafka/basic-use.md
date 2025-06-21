# 基本使用

## 安装

1. 前往 [Kafka](https://kafka.apache.org/downloads) 官网下载，这里演示的时候使用的是 3.9.1 版本
2. 解压

```shell
tar -xzf kafka_2.13-3.9.1.tgz
mv kafka_2.13-3.9.1 kafka
cd kafka
```

3. 使用 KRaft 启动 Kafka（可以看完 4 再做这一步）

```shell
# 第一步
KAFKA_CLUSTER_ID="$(bin/kafka-storage.sh random-uuid)"
# 第二步
bin/kafka-storage.sh format --standalone -t $KAFKA_CLUSTER_ID -c config/kraft/reconfig-server.properties
# 第三步
bin/kafka-server-start.sh config/kraft/reconfig-server.properties
```

4. 修改默认的配置文件

为了能够成功使用 Kafdrop 可视化 WebUI 便于我们观察 Kafka，需要对默认的`config/kraft/reconfig-server.properties`做一些修改

```properties
# ip修改为虚拟机ip
listeners=PLAINTEXT://192.168.10.110:9092,CONTROLLER://192.168.10.110:9093
advertised.listeners=PLAINTEXT://192.168.10.110:9092,CONTROLLER://192.168.10.110:9093
```

5. 使用 WebUI（要求 4 和 3 都完成了）
   前往官网下载[Kafdrop](https://github.com/obsidiandynamics/kafdrop/releases)
   使用如下命令启动

```shell
java --add-opens=java.base/sun.nio.ch=ALL-UNNAMED -jar kafdrop-4.1.0.jar --kafka.brokerConnect=192.168.10.110:9092
```

启动完之后访问 [localhost:9000](http://localhost:9000) 即可
