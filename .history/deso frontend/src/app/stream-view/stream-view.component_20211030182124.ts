import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild("scrollUp") scrollUpElement: ElementRef;
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
  rerendered() {
    console.log("rerendered")
    console.log(this.chatMessages)
  }


  getChatMessages() {
    this.chatMessages = this.webSocketService.chatMessages
  }

  sendMessage(msg) {
    // TODO check if the user is logged in -- only then allow message
    if (this.globalVars.loggedInUser.ProfileEntryResponse) {
      const chatMessageDto = new ChatMessageDto(this.globalVars.loggedInUser.ProfileEntryResponse.Username, msg);
      this.webSocketService.sendMessage(chatMessageDto);
    } else {
      const chatMessageDto = new ChatMessageDto(this.globalVars.loggedInUser.PublicKeyBase58Check, msg);
      this.webSocketService.sendMessage(chatMessageDto);
    }
  }

  // sendMessage(sendForm: NgForm) {
  //   // TODO check if the user is logged in -- only then allow message
  //   if (this.globalVars.loggedInUser.ProfileEntryResponse) {
  //     const chatMessageDto = new ChatMessageDto(this.globalVars.loggedInUser.ProfileEntryResponse.Username, sendForm.value.message);
  //     this.webSocketService.sendMessage(chatMessageDto);
  //   } else {
  //     const chatMessageDto = new ChatMessageDto(this.globalVars.loggedInUser.PublicKeyBase58Check, sendForm.value.message);
  //     this.webSocketService.sendMessage(chatMessageDto);
  //   }
  //   sendForm.controls.message.reset();
  // }


  // colors = ["#e51c23", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#5677fc", "#03a9f4", "#00bcd4", "#009688", "#259b24", "#8bc34a", "#afb42b", "#ff9800", "#ff5722", "#795548", "#607d8b"]
  // usernameToColor = {}
  // usernameColor(username) {
  //   console.log("hash function called")
  //   if (this.usernameToColor[username]) {
  //     return this.usernameToColor[username]
  //   }
  //   let hash = 0
  //   if (username.length === 0) { return this.colors[0]; }
  //   for (var i = 0; i < username.length; i++) {
  //     hash = username.charCodeAt(i) + ((hash << 5) - hash);
  //     hash = hash & hash;
  //   }
  //   hash = ((hash % this.colors.length) + this.colors.length) % this.colors.length
  //   console.log(hash)
  //   this.usernameToColor[username] = this.colors[hash]
  //   return this.colors[hash];
  // }

  showUsernameInChat(username) {
    if (username.length < 25) {
      return username + ": "
    } else {
      return (username.slice(0, 25) + "... " + ": ")
    }
  }

  // unfollowStreamer() {
  //   this.following = false
  //   console.log("unfollowing")
  //   this.backendApi.jwtPost(`${environment.apiURL}`, `/unfollow/${this.streamerProfile.PublicKeyBase58Check}`, this.globalVars.loggedInUser.PublicKeyBase58Check, { PublicKeyBase58Check: this.globalVars.loggedInUser.PublicKeyBase58Check }).subscribe((data) => { })
  // }

  constructor(public webSocketService: WebSocketService, public globalVars: GlobalVarsService, private router: Router, private http: HttpClient, private route: ActivatedRoute, private backendApi: BackendApiService) {
  }
  @HostListener('window:popstate', ['$event'])

  destroy() {
    console.log("destroy called")
    if (this.webSocketService.webSocket) {
      this.webSocketService.closeWebSocket()
    }
    if (this.player) {
      this.player.destroy()
      console.log("player destroyed")
    }
    this.chatMessages = []
    this.chatSocket = undefined
  }

  onPopState(event) {
    this.destroy()
  }
  chatSocket
  paramSubscription

  // get access to streamer public key from param and then query backend for stream and then use user public key to populate following. if public key not found in streams then show page 404. 
  orderby: string;
  data
  async ngOnInit() {
    console.log("stream view init called")
    this.globalVars._updateDeSoExchangeRate()
    this.destroy()
    this.paramSubscription = this.route.paramMap.subscribe(params => {
      this.streamerUsername = params.get("username")
      console.log("streamerusername", this.streamerUsername)
      this.backendApi.GetSingleProfile(this.globalVars.localNode, "", this.streamerUsername).subscribe((data) => {
        this.streamerProfile = data.Profile
        this.streamerPublicKey = this.streamerProfile.PublicKeyBase58Check
        console.log(this.streamerPublicKey)
        this.getStreamer();
      }, (err)=> {console.log("error:",err)})

    })

  }

  goToSettings() {
    this.router.navigate(['settings'])
  }


  redirectToHomePage() {
    // this.destroy()
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
    this.paramSubscription.unsubscribe()
    this.destroy()
    this.ngOnInit()
  }

  onStreamChange() {
    console.log("stream changed")
    this.destroy()
    // automatically refresh the stream view
  }

  async getStreamer() {
    this.data = await this.http.get(`${environment.apiURL}/stream/${this.streamerPublicKey}`).toPromise();
    console.log(this.data)
    this.streamer = this.data
    if (!this.streamer.stream) {
      this.router.navigate([this.globalVars.RouteNames.NOT_FOUND])
    }
    this.streamDescription = this.streamer.stream.description
    this.streamTitle = this.streamer.stream.title
    this.streamCategory = this.streamer.stream.category
    this.isStreamerLive = this.streamer.stream.isLive
    this.data = await this.backendApi.GetSingleProfilePicture(
      this.globalVars.localNode,
      this.streamerProfile.PublicKeyBase58Check,
      this.globalVars.profileUpdateTimestamp ? `?${this.globalVars.profileUpdateTimestamp}` : ""
    ).toPromise()
    console.log(this.data)
    this._readImageFileToProfilePicInput(this.data);
    // change this
  //   if (p2pml.hlsjs.Engine.isSupported()) {
  //     var engine = new p2pml.hlsjs.Engine();
  //     var loader = engine.createLoaderClass();
  //   } else {
  //     // var loader = XHRLoader;
  //   }
  //   try {
  //   var engine = new p2pml.hlsjs.Engine();
  //   this.player = new Clappr.Player({
  //     parentId: "#video",
  //     source: `http://ec2-18-216-128-152.us-east-2.compute.amazonaws.com/live/${this.streamer.stream._id}/index.m3u8`,
  //     width: "100%",
  //     height: "100%",
  //     playback: {
  //       hlsjsConfig: {
  //         liveSyncDurationCount: 7,
  //         loader: loader
  //       }
  //     }
  //   });
  //   if (p2pml.hlsjs.Engine.isSupported()) p2pml.hlsjs.initClapprPlayer(this.player);
  //   this.player.play(true);
  // } catch (error) { console.log(error) }
    if (!this.chatSocket) {
      this.chatSocket = this.webSocketService.openWebSocket(this.streamerPublicKey)
      this.getChatMessages()
    }


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
