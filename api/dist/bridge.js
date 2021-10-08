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
const wss = new ws_1.default.WebSocketServer({
    port: 8069
});
var topics = {};
function addClient(ws, topic) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!topics[topic]) {
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
    });
}
wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost:8069/');
    var topic = url.pathname.replace(/\//g, '_');
    addClient(ws, topic);
});
//# sourceMappingURL=bridge.js.map