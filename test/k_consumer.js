const { Kafka } = require('kafkajs')

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['127.0.0.1:9092']
});

const consumer = kafka.consumer({ groupId: 'chat' });

const run = async () => {
  await consumer.connect();
  console.log('Connected to broker');
  await consumer.subscribe({ topic: 'chat/username' });
  console.log('Subscribed');
  await consumer.run({
    eachMessage: async ({ topic, partition, message}) => {
      console.log(topic, partition, message);
    }
  });
}

run().catch(e => console.error(`[example/consumer] ${e.message}`, e))
