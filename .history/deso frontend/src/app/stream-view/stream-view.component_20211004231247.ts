import { Component, OnInit } from '@angular/core';
import { AppRoutingModule } from "../app-routing.module";
import { GlobalVarsService } from "../global-vars.service";
import { Router } from "@angular/router";
import { SearchBarComponent } from '../search-bar/search-bar.component'
import { HttpClient } from '@angular/common/http';
import Clappr from '@clappr/core'

@Component({
  selector: 'app-stream-view',
  templateUrl: './stream-view.component.html',
  styleUrls: ['./stream-view.component.scss']
})
export class StreamViewComponent implements OnInit {
  if (p2pml.hlsjs.Engine.isSupported()) {
    var engine = new p2pml.hlsjs.Engine();
    var loader = engine.createLoaderClass();
  } else {
    var loader = XHRLoader;
  }
  var engine = new p2pml.hlsjs.Engine();
  var player = new Clappr.Player({
    parentId: "#video",
    source: "http://149.159.16.161:8082/live/615bba8d7db93bbee3d42621/index.m3u8",
    width:"100%",
    height:"100%",
    playback: {
      hlsjsConfig: {
        liveSyncDurationCount: 7,
        loader: loader
      }
    }
  });
  if (p2pml.hlsjs.Engine.isSupported()) p2pml.hlsjs.initClapprPlayer(player);
  player.play(true);
  streamers
  constructor(public globalVars: GlobalVarsService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.getStreamers()
    var playerElement = document.querySelector(".player");
    var player = new Clappr.Player({
      source: "http://149.159.16.161:8082/live/615bba8d7db93bbee3d42621/index.m3u8",
      parent: playerElement,
    });
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
