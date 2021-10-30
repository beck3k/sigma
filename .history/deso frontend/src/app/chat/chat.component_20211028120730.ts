import { Component, OnInit, Input, ChangeDetectionStrategy , OnChanges, DoCheck} from '@angular/core';
import { GlobalVarsService } from '../global-vars.service'
import { WebSocketService, ChatMessageDto } from '../web-socket.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit {

  constructor(private globalVars: GlobalVarsService, private webSocketService: WebSocketService) { }
  prevMessages
  @Input() chatMessages

  // mgDoChanges() {
  //   this.prev = count
  // }
  // ngDoCheck() {
  //   if (this.prevCount.value !== this.count.value)
  //     this.cd.markForCheck()
  // }

  ngOnInit(): void {
  }

  getChatMessages() {
    this.chatMessages = this.webSocketService.chatMessages
  }

  sendMessage(sendForm: NgForm) {
    // TODO check if the user is logged in -- only then allow message
    if (this.globalVars.loggedInUser.ProfileEntryResponse) {
      const chatMessageDto = new ChatMessageDto(this.globalVars.loggedInUser.ProfileEntryResponse.Username, sendForm.value.message);
      this.webSocketService.sendMessage(chatMessageDto);
    } else {
      const chatMessageDto = new ChatMessageDto(this.globalVars.loggedInUser.PublicKeyBase58Check, sendForm.value.message);
      this.webSocketService.sendMessage(chatMessageDto);
    }
    sendForm.controls.message.reset();
  }


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
    console.log(hash)
    this.usernameToColor[username] = this.colors[hash]
    return this.colors[hash];
  }

  showUsernameInChat(username) {
    if (username.length < 25) {
      return username + ": "
    } else {
      return (username.slice(0, 25) + "... " + ": ")
    }
  }

}
