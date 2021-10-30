"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
class SocketBridge {
    constructor() {
        this.topics = {};
        this.disconnectCallbacks = [];
        this.connectCallbacks = [];
        this.onmessageCallbacks = [];
    }
    addClient(ws, topic) {
        return __awaiter(this, void 0, void 0, function* () {
            var handler = this;
            if (!this.topics[topic]) {
                this.topics[topic] = {
                    clients: []
                };
            }
            this.topics[topic].clients.push(ws);
            this.connectCallbacks.forEach(connect => {
                connect(topic, handler.topics[topic].clients.length);
            });
            ws.on('message', (m) => {
                console.log(JSON.parse(m));
                handler.topics[topic].clients.forEach((socket) => {
                    console.log('send ', m.toString(), ' to ', 'dumbfuck', 'topicshit: ', topic);
                    socket.send(m);
                });
                this.onmessageCallbacks.forEach(message => {
                    message(topic, JSON.parse(m));
                });
            });
            ws.on('close', () => {
                handler.topics[topic].clients.splice(handler.topics[topic].clients.indexOf(ws), 1);
                handler.disconnectCallbacks.forEach(disconnect => {
                    disconnect(topic, handler.topics[topic].clients.length);
                });
            });
        });
    }
    start() {
        const wss = new ws_1.default.WebSocketServer({
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
    onMessage(callback) {
        this.onmessageCallbacks.push(callback);
    }
}
exports.default = SocketBridge;
//# sourceMappingURL=bridge.js.map