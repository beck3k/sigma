import { Component, OnInit } from '@angular/core';
import { AppRoutingModule } from "../app-routing.module";
import { GlobalVarsService } from "../global-vars.service";
import { Router } from "@angular/router";
import { SearchBarComponent } from '../search-bar/search-bar.component'
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

declare var p2pml: any;
declare var Clappr: any;

@Component({
  selector: 'app-stream-view',
  templateUrl: './stream-view.component.html',
  styleUrls: ['./stream-view.component.scss']
})
export class StreamViewComponent implements OnInit {
  streamer
  constructor(public globalVars: GlobalVarsService, private router: Router, private http: HttpClient, private route: ActivatedRoute) { }

 // get access to streamer public key from param and then query backend for stream and then use user public key to populate following. if public key not found in streams then show page 404. 
 orderby: string;
 streamers
  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      this.streamer = params.get("publicKey")
    })

  

    this.getStreamers();
    console.log(this.streamers)

  }

  

  createStream(){
    this.http.post("http://149.159.16.161:3123/stream", {publicKey: this.globalVars.loggedInUser.PublicKeyBase58Check}).subscribe((data)=>{
      console.log(data)
    })
  }

  getStreamers() {
    this.http.get("http://149.159.16.161:3123/streams").subscribe((data)=>{
    this.streamers = data 
    if (p2pml.hlsjs.Engine.isSupported()) {
      var engine = new p2pml.hlsjs.Engine();
      var loader = engine.createLoaderClass();
    } else {
      // var loader = XHRLoader;
    }
    var engine = new p2pml.hlsjs.Engine();
    var player = new Clappr.Player({
      parentId: "#video",
      source: `http://149.159.16.161:8082/live/${this.streamers.streams[0]._id}/index.m3u8`,
      width:"100%",
      height:"100%",
      playback: {
        hlsjsConfig: {
          liveSyncDurationCount: 7,
          loader: loader
        }
      }
    });
    console.log(`http://149.159.16.161:8082/live/${this.streamers.streams[0]._id}/index.m3u8`)
    console.log(this.streamers)
    if (p2pml.hlsjs.Engine.isSupported()) p2pml.hlsjs.initClapprPlayer(player);
    player.play(true);
    console.log(player);
    console.log(p2pml.hlsjs.Engine.isSupported())})
  }


}
