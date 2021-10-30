import { Component, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-send-chat-form',
  templateUrl: './send-chat-form.component.html',
  styleUrls: ['./send-chat-form.component.scss']
})
export class SendChatFormComponent implements OnInit {

  constructor() { }
  @Output() messageSent
  ngOnInit(): void {
  }

  sendMessage(sendForm: NgForm) {
    // TODO check if the user is logged in -- only then allow message
    this.messageSent.emit(sendForm.value.message);
  }

}
