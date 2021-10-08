const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['127.0.0.1:9092']
});

const producer = kafka.producer();

const run = async () => {
  await producer.connect();
  await producer.send({
    topic: 'chat/username',
    messages: [
      {user: "beck", value: "this is a message"}
    ]
  });

}

run().catch(e => console.log(e));
