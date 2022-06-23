import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export class ChatMessageDto {
  user: string;
  message: string;

  constructor(user: string, message: string){
      this.user = user;
      this.message = message;
  }
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  colors = ["#e51c23", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#5677fc", "#03a9f4", "#00bcd4", "#009688", "#259b24", "#8bc34a", "#afb42b", "#ff9800", "#ff5722", "#795548", "#607d8b"]
  usernameToColor = {}
  usernameColor(username) {
    console.log("hash function called")
    if (this.usernameToColor[username]) {
      return this.usernameToColor[username]
    }
    let hash = 0
    if (username.length === 0) { return this.colors[0]; }
    for (var i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    hash = ((hash % this.colors.length) + this.colors.length) % this.colors.length
    this.usernameToColor[username] = this.colors[hash]
    return this.colors[hash];
  }

  webSocket: WebSocket;
  chatMessages= [];

  constructor( private http: HttpClient) { }

  getChatMessages(publicKey){
    this.http.get(`${environment.apiURL}/streams/${publicKey}`).subscribe((data: {messages}) => {
      console.log(data)
      this.chatMessages = data.messages
    })
  }
  public openWebSocket(publicKey){
    this.webSocket = new WebSocket(`ws://ec2-3-144-203-39.us-east-2.compute.amazonaws.com:8069/chat/${publicKey}`);
    // this.webSocket = new WebSocket(`ws://127.0.0.1:8069/chat/${username}`);

    this.webSocket.onopen = (event) => {
      console.log('Open: ', event);
      this.getChatMessages(publicKey);
      // this.chatMessages = []
    };

    this.webSocket.onmessage = async (event) => {
      let chat = await new Response(event.data).json()
      this.chatMessages.push({...chat, color: `${this.usernameColor(chat.user)}`});
    };

    this.webSocket.onclose = (event) => {
      console.log('Close: ', event);
    };
  }

  public sendMessage(chatMessageDto: ChatMessageDto){
    this.webSocket.send(JSON.stringify(chatMessageDto));
  }

  public closeWebSocket() {
    this.chatMessages = []
    this.webSocket.close();
  }
}
