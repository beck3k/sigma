import { Component, OnInit } from '@angular/core';
import { AppRoutingModule } from "../app-routing.module";
import { GlobalVarsService } from "../global-vars.service";
import { Router } from "@angular/router";
import { SearchBarComponent } from '../search-bar/search-bar.component'
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BackendApiService } from '../backend-api.service'

declare var p2pml: any;
declare var Clappr: any;

@Component({
  selector: 'app-stream-view',
  templateUrl: './stream-view.component.html',
  styleUrls: ['./stream-view.component.scss']
})
export class StreamViewComponent implements OnInit {
  streamer // from our backend -- gives stream url so we can play in the video player
  streamerProfile // taken from get-single-profile
  streamerUsername // taken from url
  streamerProfilePicture // taken from get-single-profile-picture
  constructor(public globalVars: GlobalVarsService, private router: Router, private http: HttpClient, private route: ActivatedRoute, private backendApi: BackendApiService) { }

  // get access to streamer public key from param and then query backend for stream and then use user public key to populate following. if public key not found in streams then show page 404. 
  orderby: string;
  ngOnInit(): void {
    this.globalVars._updateDeSoExchangeRate()
    this.route.paramMap.subscribe(params => {
      this.streamerUsername = params.get("username")
      this.getStreamer();
    })

  }



  createStream() {
    this.http.post("http://149.159.16.161:3123/stream", { username: this.globalVars.loggedInUser.ProfileEntryResponse.Username, publicKey: this.globalVars.loggedInUser.PublicKeyBase58Check }).subscribe((data) => {
    })
  }

  getStreamer() {
    this.http.get(`http://149.159.16.161:3123/stream/${this.streamerUsername}`).subscribe((data)=>{
    this.streamer = data
    // // get creators - creator coin value and username -- work here
    // this.streamer = {
    //   streams: [
    //     {
    //       _id: "615e20379a87aee1a0d381e5",
    //       publicKey: "BC1YLj4aFMVM1g44wBgibYq8dFQ1NxTCpQFyJnNMqGqmyUt9zDVjZ5L",
    //       username: "shivamgarg",
    //       __v: 0
    //     }
    //   ]
    // }
    this.backendApi.GetSingleProfile(this.globalVars.localNode, "", this.streamerUsername).subscribe(
      (res) => {
        this.streamerProfile = res.Profile;
      },
    );

    this.backendApi.GetSingleProfilePicture(
      this.globalVars.localNode,
      this.streamer.stream[0].publicKey,
      this.globalVars.profileUpdateTimestamp ? `?${this.globalVars.profileUpdateTimestamp}` : ""
    )
      .subscribe((res) => {
        this._readImageFileToProfilePicInput(res);
        console.log(res)
      });


    console.log("request made")

    if (p2pml.hlsjs.Engine.isSupported()) {
      var engine = new p2pml.hlsjs.Engine();
      var loader = engine.createLoaderClass();
    } else {
      // var loader = XHRLoader;
    }
    var engine = new p2pml.hlsjs.Engine();
    var player = new Clappr.Player({
      parentId: "#video",
      source: `http://149.159.16.161:8082/live/${this.streamer.stream[0]._id}/index.m3u8`,
      width: "100%",
      height: "100%",
      playback: {
        hlsjsConfig: {
          liveSyncDurationCount: 7,
          loader: loader
        }
      }
    });
    if (p2pml.hlsjs.Engine.isSupported()) p2pml.hlsjs.initClapprPlayer(player);
    player.play(true);
    })
  }

  _readImageFileToProfilePicInput(file: Blob | File) {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event: any) => {
      const base64Image = btoa(event.target.result);
      this.streamerProfilePicture = `data:${file.type};base64,${base64Image}`;
    };
  }
}
