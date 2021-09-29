import { Component, OnInit } from '@angular/core';
import {onMount} from 'svelte'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit {

  identityUrl ='https://identity.deso.org'
	
	identityWindow
	user;
	userPayload;
	loggedIn = false;
	
	launchLogin(){
			const h = 1000;
			const w = 800;
			const y = window.outerHeight / 2 + window.screenY - h / 2;
			const x = window.outerWidth / 2 + window.screenX - w / 2;
			window.addEventListener('message', (event) => {
				console.log(event)
				//do we have data
				if(event.data && event.origin){
					//can we trust it
					if(event.origin ==='https://identity.bitclout.com'){
						
						//initialize
						if(event.data.method ==='initialize'){
							console.log('initialize')
						
							const data = {id:event.data.id,service: 'identity'};
							console.log(data)
							
							console.log(location.origin)
							this.identityWindow.postMessage(data,'*');
							//event.source.postMessage(data,location.origin)
						}
						//login
						if(event.data.method ==='login'){
							this.user = event.data.payload.publicKeyAdded;
							console.log(this.user);
							this.userPayload = event.data.payload.users[this.user];
							console.log(this.userPayload);
							this.loggedIn = true;
							this.identityWindow.close();
						}
					}
					
				}
			
			},false);
		
			this.identityWindow = window.open(this.identityUrl + '/log-in', null, `toolbar=no, width=${w}, height=${h}, top=${y}, left=${x}`);
		
			
		}



// Can be added to any path for testnet deso and bitcoin addresses

  constructor() { }

  SetStorage(key: string, value: any) {
    localStorage.setItem(key, value ? JSON.stringify(value) : "");
  }

  ngOnInit(): void {
  }

  onClick() {
    console.log("button clicked")
    this.launchLogin()
    console.log("after")
  }



}
