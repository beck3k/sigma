import { Component, OnInit } from '@angular/core';
import {AfterViewInit, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import videojs from 'video.js';
import { AppRoutingModule } from "../app-routing.module";
import { GlobalVarsService } from "../global-vars.service";
import { Router } from "@angular/router";
import { SearchBarComponent } from '../search-bar/search-bar.component'
import { HttpClient } from '@angular/common/http';
declare var require: any;
require('videojs-contrib-quality-levels');
require('videojs-hls-quality-selector');

@Component({
  selector: 'app-stream-view',
  templateUrl: './stream-view.component.html',
  styleUrls: ['./stream-view.component.scss']
})
export class StreamViewComponent implements OnInit, AfterViewInit, OnDestroy {
  streamers
  constructor(public globalVars: GlobalVarsService, private router: Router, private http: HttpClient) { }

  public player: videojs.Player;


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

  ngAfterViewInit() {
    const options = {
      'sources': [{
        'src': "http://149.159.16.161:8082/live/615bba8d7db93bbee3d42621/index.m3u8",
        'type': 'application/x-mpegURL'
      }
      ],
      // 'poster' : this.urlPoster
    };
    this.player = videojs('my-video', options, function onPlayerReady() {
      console.log('Player ready');
      var myPlayer = this, id = myPlayer.id();
      myPlayer.hlsQualitySelector();
    });

  }

  ngOnDestroy(): void {
    if (this.player != null) {
      this.player.dispose();
    }
  }


}
