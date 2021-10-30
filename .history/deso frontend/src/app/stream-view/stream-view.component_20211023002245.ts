import { Component, OnInit, HostListener } from '@angular/core';
import { AppRoutingModule } from "../app-routing.module";
import { GlobalVarsService } from "../global-vars.service";
import { Router, NavigationExtras } from "@angular/router";
import { SearchBarComponent } from '../search-bar/search-bar.component'
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BackendApiService } from '../backend-api.service'
import { OnDestroy, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { WebSocketService, ChatMessageDto } from '../web-socket.service';
import { environment } from '../../environments/environment'

declare var p2pml: any;
declare var Clappr: any;

@Component({
  selector: 'app-stream-view',
  templateUrl: './stream-view.component.html',
  styleUrls: ['./stream-view.component.scss']
})
export class StreamViewComponent implements OnInit, OnDestroy {
  streamer // from our backend -- gives stream url so we can play in the video player
  streamerProfile // taken from get-single-profile
  streamerUsername // taken from url
  streamerProfilePicture // taken from get-single-profile-picture
  // followedStreamersList
  player
  chatMessages
  streamTitle
  streamerPublicKey
  streamDescription
  streamCategory
  isStreamerLive
  ngOnDestroy(): void {
    this.destroy()
  }

  // following = false

  getChatMessages() {
    console.log("from websocket messages: ", this.webSocketService.chatMessages)
    this.chatMessages = this.webSocketService.chatMessages
  }
  sendMessage(sendForm: NgForm) {
    // TODO check if the user is logged in -- only then allow message
    const chatMessageDto = new ChatMessageDto(this.globalVars.loggedInUser.ProfileEntryResponse.Username, sendForm.value.message);
    this.webSocketService.sendMessage(chatMessageDto);
    sendForm.controls.message.reset();
  }

  // unfollowStreamer() {
  //   this.following = false
  //   console.log("unfollowing")
  //   this.backendApi.jwtPost(`${environment.apiURL}`, `/unfollow/${this.streamerProfile.PublicKeyBase58Check}`, this.globalVars.loggedInUser.PublicKeyBase58Check, { PublicKeyBase58Check: this.globalVars.loggedInUser.PublicKeyBase58Check }).subscribe((data) => { })
  // }

  constructor(public webSocketService: WebSocketService, public globalVars: GlobalVarsService, private router: Router, private http: HttpClient, private route: ActivatedRoute, private backendApi: BackendApiService) {
    console.log("constructor called")
  }
  @HostListener('window:popstate', ['$event'])

  destroy() {
    if (this.webSocketService.webSocket) {
      this.webSocketService.closeWebSocket()
    }
    if (this.player) {
      this.player.destroy()
    }
    this.chatMessages = []
    this.chatSocket = undefined
  }
  onPopState(event) {
    this.destroy()
  }
  chatSocket

  // get access to streamer public key from param and then query backend for stream and then use user public key to populate following. if public key not found in streams then show page 404. 
  orderby: string;
  ngOnInit(): void {
    console.log('init called to destoy')
    this.globalVars._updateDeSoExchangeRate()
    this.route.paramMap.subscribe(params => {
      this.streamerPublicKey = params.get("publicKey")
      this.getStreamer();
      if (this.player) {
        this.player.destroy()
      }
    })


  }

  goToSettings() {
    this.router.navigate(['settings'])
  }


  redirectToHomePage() {
    // this.destroy()
    console.log("clicked")
    this.router.navigate(['/'])
  }

  // goBackToChannel() {
  //   if (this.globalVars.loggedInUser.ProfileEntryResponse.Username===this.streamerUsername){
  //     return
  //   }
  //   this.destroy()
  //   this.router.navigate([`/${this.globalVars.loggedInUser.ProfileEntryResponse.Username}`])
  // }

  // changeStream(newStreamerPublicKey) {
  //   this.backendApi.GetSingleProfile(this.globalVars.localNode, newStreamerPublicKey, "").subscribe(
  //     (res) => {
  //     this.destroy()
  //     this.router.navigate(['../',res.Profile.Username],{relativeTo: this.route})})
  // }

  // followStreamer() {
  //   console.log("called")
  //   this.following = true
  //   this.backendApi.jwtPost(`${environment.apiURL}`, `/follow/${this.streamerProfile.PublicKeyBase58Check}`, this.globalVars.loggedInUser.PublicKeyBase58Check, { PublicKeyBase58Check: this.globalVars.loggedInUser.PublicKeyBase58Check }).subscribe((data) => { console.log(data) })
  // }

  // followedStreamers() {
  //   this.backendApi.jwtGet(`${environment.apiURL}`, '/following', this.globalVars.loggedInUser.PublicKeyBase58Check).subscribe((data) => {
  //     this.followedStreamersList = data
  //     this.following = this.followedStreamersList.following.includes(this.streamerProfile.PublicKeyBase58Check)

  //   })
  // }

  onAccountChange() {
    this.ngOnInit()
    this.destroy()
  }

  getStreamer() {
    this.http.get(`${environment.apiURL}/stream/${this.streamerPublicKey}`).subscribe((data) => {
      this.streamer = data
      console.log("fuck u:", data, !this.streamer.stream)
      if (!this.streamer.stream) {
        this.router.navigate([this.globalVars.RouteNames.NOT_FOUND])
      }
      this.streamDescription = this.streamer.stream.description
      this.streamTitle = this.streamer.stream.title
      this.streamCategory = this.streamer.stream.category
      this.isStreamerLive = this.streamer.stream.isLive
      console.log(this.isStreamerLive)
      console.log(this.streamer)
    })
    this.backendApi.GetSingleProfile(this.globalVars.localNode, this.streamerPublicKey, "").subscribe(
      (res) => {
        this.streamerProfile = res.Profile;
        this.streamerUsername = this.streamerProfile.Username

        this.backendApi.GetSingleProfilePicture(
          this.globalVars.localNode,
          this.streamerProfile.PublicKeyBase58Check,
          this.globalVars.profileUpdateTimestamp ? `?${this.globalVars.profileUpdateTimestamp}` : ""
        )
          .subscribe((res) => {
            this._readImageFileToProfilePicInput(res);
            // change this
            if (p2pml.hlsjs.Engine.isSupported()) {
              var engine = new p2pml.hlsjs.Engine();
              var loader = engine.createLoaderClass();
            } else {
              // var loader = XHRLoader;
            }
            var engine = new p2pml.hlsjs.Engine();
            this.player = new Clappr.Player({
              parentId: "#video",
              source: `http://149.159.16.161:8082/live/${this.streamer.stream._id}/index.m3u8`,
              width: "100%",
              height: "100%",
              playback: {
                hlsjsConfig: {
                  liveSyncDurationCount: 7,
                  loader: loader
                }
              }
            });
            if (p2pml.hlsjs.Engine.isSupported()) p2pml.hlsjs.initClapprPlayer(this.player);
            this.player.play(true);
            console.log("completed")
          });

        }
      // }, (err) => {
      //   if (err.error.error.includes("GetSingleProfile: could not find profile for username or public key")) {
      //     console.log("came here")
      //     console.log(this.globalVars.RouteNames.NOT_FOUND)
      //     this.router.navigate(['notfound', '404'])
      //   }
      // }
      )

    if (!this.chatSocket) {
      this.chatSocket = this.webSocketService.openWebSocket(this.streamerPublicKey)
      this.getChatMessages()
    }


  }

  _readImageFileToProfilePicInput(file: Blob | File) {
    console.log("here")
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event: any) => {
      const base64Image = btoa(event.target.result);
      this.streamerProfilePicture = `data:${file.type};base64,${base64Image}`;
      console.log(this.streamerProfilePicture)
    };
  }


}
