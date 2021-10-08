import { Component, OnInit } from '@angular/core';
import { AppRoutingModule } from "../app-routing.module";
import { GlobalVarsService } from "../global-vars.service";
import { Router } from "@angular/router";
import { SearchBarComponent } from '../search-bar/search-bar.component'
import { HttpClient } from '@angular/common/http';
import Clappr from '@clappr/core'
import * as hlsjs from 'p2p-media-loader-hlsjs';

@Component({
  selector: 'app-stream-view',
  templateUrl: './stream-view.component.html',
  styleUrls: ['./stream-view.component.scss']
})
export class StreamViewComponent implements OnInit {
  streamers
  constructor(public globalVars: GlobalVarsService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.getStreamers();
  }

  createStream(){
    this.http.post("http://149.159.16.161:3123/stream", {publicKey: this.globalVars.loggedInUser.PublicKeyBase58Check}).subscribe((data)=>{
      console.log(data)
    })
  }

  getStreamers() {
    this.http.get("http://149.159.16.161:3123/streams").subscribe((data)=>this.streamers = data)
  }


}
