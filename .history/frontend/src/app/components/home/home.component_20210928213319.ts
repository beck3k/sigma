import { Component, OnInit } from '@angular/core';
import {LoginFlowService} from '../../services/login-flow.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {


// Can be added to any path for testnet deso and bitcoin addresses

  constructor(private launchLoginFlowService:LoginFlowService) { }

  SetStorage(key: string, value: any) {
    localStorage.setItem(key, value ? JSON.stringify(value) : "");
  }

  ngOnInit(): void {
  }

  onClick() {
    const h = 1000;
    const w = 800;
    const y = window.outerHeight / 2 + window.screenY - h / 2;
    const x = window.outerWidth / 2 + window.screenX - w / 2;
    window.open('https://identity.deso.org/log-in',null, `toolbar=no, width=${w}, height=${h}, top=${y}, left=${x}`)
    
  }

}
