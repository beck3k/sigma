import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-send-chat-form',
  templateUrl: './send-chat-form.component.html',
  styleUrls: ['./send-chat-form.component.scss']
})
export class SendChatFormComponent implements OnInit {

  constructor() { }
  @Output() messageSent = new EventEmitter();
  ngOnInit(): void {
  }

  sendMessage(message, sendForm: NgForm) {
    // TODO check if the user is logged in -- only then allow message
    console.log(message)
    this.messageSent.emit(message);
    sendForm.controls.message.reset();
  }

}
