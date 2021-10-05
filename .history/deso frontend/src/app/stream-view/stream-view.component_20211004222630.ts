import { Component, OnInit } from '@angular/core';
import { AppRoutingModule } from "../app-routing.module";
import { GlobalVarsService } from "../global-vars.service";
import { Router } from "@angular/router";
import { SearchBarComponent } from '../search-bar/search-bar.component'
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-stream-view',
  templateUrl: './stream-view.component.html',
  styleUrls: ['./stream-view.component.scss']
})
export class StreamViewComponent implements OnInit {

  constructor(public globalVars: GlobalVarsService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
  }

  createStream(){
    this.http.post("https://http://149.159.16.161:3123/stream", {publicKey: this.globalVars.loggedInUser.PublicKeyBase58Check}).subscribe((data)=>{
      console.log(data)
    })
  }

}
