import WebSocket from 'ws';

const wss = new WebSocket.WebSocketServer({
  port: 8069
});

var topics = {};

async function addClient(ws, topic) {
  if(!topics[topic]) {
    topics[topic] = {
      clients: [],
      messages: []
    };
  }

  topics[topic].clients.push(ws);

  topics[topic].messages.forEach((msg) => {
    ws.send(msg);
  });

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
});
