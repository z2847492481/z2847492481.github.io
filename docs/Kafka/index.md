## Kafka 是什么

Kafka 是消息队列中间件。

## 特点

### Exactly-Once

推荐读 [Exactly-Once Semantics Are Possible: Here’s How Kafka Does It](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/) 这个文章来了解什么是`Exactly-Once`语义。

这里我简单的摘取其中一段描述：
:::tip
Exactly-once semantics: even if a producer retries sending a message, it leads to the message being delivered exactly once to the end consumer.
:::
