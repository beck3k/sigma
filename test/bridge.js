const { Kafka } = require('kafkajs');
const WebSocket = require('ws');

// const kafka = new Kafka({
//   clientId: 'my-app',
//   brokers: ['127.0.0.1:9092']
// });

const wss = new WebSocket.WebSocketServer({
  port: 8069
});


var topics = {};

async function addClient(ws, topic) {
  // const consumer = kafka.consumer({ groupId: 'chat' });
  // await consumer.connect();
  // await consumer.subscribe({ topic });
  // await consumer.run({
  //   eachMessage: async ({ topic, partition, message}) => {
  //     ws.send(message);
  //   }
  // });
  // const producer = kafka.producer();
  // producer.connect();
  // ws.on('message', (m) => {
  //   console.log(m.toString());
  // });

  if(!topics[topic]) {
    topics[topic] = {
      clients: [],
      messages: []
    }
  }

  topics[topic].clients.push(ws);

  topics[topic].messages.forEach((msg) => {
    ws.send(msg);
  })

  ws.on('message', (m) => {
    topics[topic].clients.forEach((socket) => {
      topics[topic].messages.push(m);
      socket.send(m);
    });
  });
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost:8069/');
  var topic = url.pathname.replace(/\//g, '_');
  addClient(ws, topic);
  // ws.on('message', (m) => {
  //   console.log(m);
  //   ws.send('bastard')
  // })
  // console.log(ws);
  // console.log('req', req.url)
});
