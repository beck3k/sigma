import { Component, OnInit } from '@angular/core';
import {LoginFlowService} from '../../services/login-flow.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  login   = ()=>{window.open('https://identity.deso.org/log-in')}
  signUp  = ()=>{window.open('https://identity.deso.org/sign-up')}

// Can be added to any path for testnet deso and bitcoin addresses

  constructor(private launchLoginFlowService:LoginFlowService) { }

  ngOnInit(): void {
  }

  onClick() {
    console.log("yop")
    this.launchLoginFlowService.launchLoginFlow()
    console.log("he")
  }

}
