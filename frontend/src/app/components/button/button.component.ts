import { Component, OnInit,Input, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.sass']
})
export class ButtonComponent implements OnInit {
  
  @Input() text: string = ""
  @Output() click = new EventEmitter()

  constructor() { }

  ngOnInit(): void {
  }

  onClick(){
    this.click.emit()
  }

}
