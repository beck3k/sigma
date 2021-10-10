const WebSocket = require('ws');

const ws = new WebSocket('ws://149.159.16.161:8069/chat/BC1YLj4aFMVM1g44wBgibYq8dFQ1NxTCpQFyJnNMqGqmyUt9zDVjZ5L');

ws.on('open', function open() {
  const msg = {
    user: `${Math.random()}`,
    message: 'Hello world'
  }
  ws.send(JSON.stringify(msg));
});

ws.on('message', function incoming(message) {
  console.log('received: %s', message);
});
