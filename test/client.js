const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:8069/chat/shit');

ws.on('open', function open() {
  const msg = {
    username: Math.random(),
    message: 'Hello world'
  }
  ws.send(JSON.stringify(msg));
});

ws.on('message', function incoming(message) {
  console.log('received: %s', message);
});
