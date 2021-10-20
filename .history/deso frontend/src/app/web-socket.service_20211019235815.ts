import { Injectable } from '@angular/core';

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

  webSocket: WebSocket;
  chatMessages= [];

  constructor() { }

  public openWebSocket(username){
    this.webSocket = new WebSocket(`http://ec2-3-144-203-39.us-east-2.compute.amazonaws.com:8069/chat/${username}`);

    this.webSocket.onopen = (event) => {
      console.log('Open: ', event);
      // this.chatMessages = []
    };

    this.webSocket.onmessage = async (event) => {
      console.log(event)
      console.log(await new Response(event.data).json())
      this.chatMessages.push(await new Response(event.data).json());
    };

    this.webSocket.onclose = (event) => {
      console.log('Close: ', event);
    };
  }

  public sendMessage(chatMessageDto: ChatMessageDto){
    console.log(JSON.stringify(chatMessageDto))
    this.webSocket.send(JSON.stringify(chatMessageDto));
  }

  public closeWebSocket() {
    this.chatMessages = []
    this.webSocket.close();
  }
}