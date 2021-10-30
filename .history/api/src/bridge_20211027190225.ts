import WebSocket from 'ws';

class SocketBridge {
  disconnectCallbacks;
  connectCallbacks;
  topics = {};

  constructor() {
    this.disconnectCallbacks = [];
    this.connectCallbacks = [];
  }

  async addClient(ws, topic) {
    var handler = this;
    if(!this.topics[topic]) {
      this.topics[topic] = {
        clients: [],
        messages: []
      };
    }
  
    this.topics[topic].clients.push(ws);
  
    this.topics[topic].messages.forEach((msg) => {
      ws.send(msg);
    });

    this.connectCallbacks.forEach(connect => {
      connect(topic, handler.topics[topic].clients.length);
    });
  
    ws.on('message', (m) => {
      console.log(JSON.parse(m));
      handler.topics[topic].messages.push(m);
      handler.topics[topic].clients.forEach((socket) => { 
        console.log('send ', m.toString(), ' to ', 'dumbfuck', 'topicshit: ', topic);  
        socket.send(m);
      });
    });
    ws.on('close', () => {
      handler.topics[topic].clients.splice(handler.topics[topic].clients.indexOf(ws), 1);
      handler.disconnectCallbacks.forEach(disconnect => {
        disconnect(topic, handler.topics[topic].clients.length);
      });
    });
  }

  start() {
    const wss = new WebSocket.WebSocketServer({
      port: 8069
    });
    
    console.log('chotiya');
    var handler = this;
    
    wss.on('connection', (ws, req) => {
      const url = new URL(req.url, 'http://localhost:8069/');
      var topic = url.pathname.replace(/\//g, '_');
      ws.id = Math.random();
      handler.addClient(ws, topic);
      console.log('looser ', ws.id, ' connected to ', topic);
    });
  }

  onDisconnect(callback) {
    this.disconnectCallbacks.push(callback);
  }

  onConnect(callback) {
    this.connectCallbacks.push(callback);
  }
}

export default SocketBridge;

