import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from '../global-vars.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BackendApiService } from '../backend-api.service';
import { environment } from '../../environments/environment'

declare var p2pml: any;
declare var Clappr: any;

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  constructor(public globalVars: GlobalVarsService, private router: Router, private http: HttpClient, private route: ActivatedRoute, private backendApi: BackendApiService) { }
  followedStreamersList
  streamTitle
  streamDescription
  streamCategory
  streamer // from our backend -- gives stream url so we can play in the video player
  streamerProfile // taken from get-single-profile
  streamerUsername // taken from url
  streamerProfilePicture // taken from get-single-profile-picture
  player
  anyoneLive = false
  streamNumber
  categories
  ngOnInit(): void {
    console.log("init called")
    this.getCategories()
    this.followedStreamers();

  }

  changeStream(newStreamerPublicKey) {
    this.backendApi.GetSingleProfile(this.globalVars.localNode, newStreamerPublicKey, "").subscribe(
      (res) => {
        if (this.player) {
          this.player.destroy()
        }
        this.router.navigate([res.Profile.Username], { relativeTo: this.route })
      })
  }


  goLive() {
    this.router.navigate([`dashboard`])
  }

  followedStreamers() {
    // get one random stream that is live
    this.http.get(`${environment.apiURL}/streams/live/one`).subscribe((data: { stream }) => {
      console.log("data:", data)
      if (data.stream) {
        this.anyoneLive = true
      }
      if (this.anyoneLive) {
        this.streamCategory = data.stream.category
        console.log(this.streamCategory)
        this.streamTitle = data.stream.title
        this.streamDescription = data.stream.description
        this.backendApi.GetSingleProfile(this.globalVars.localNode, data.stream.publicKey, "").subscribe(
          (res) => {
            this.streamerProfile = res.Profile;
            console.log(this.streamerProfile)
            this.backendApi.GetSingleProfilePicture(
              this.globalVars.localNode,
              this.streamerProfile.PublicKeyBase58Check,
              this.globalVars.profileUpdateTimestamp ? `?${this.globalVars.profileUpdateTimestamp}` : ""
            )
              .subscribe((res) => {
                this._readImageFileToProfilePicInput(res);
                if (p2pml.hlsjs.Engine.isSupported()) {
                  var engine = new p2pml.hlsjs.Engine();
                  var loader = engine.createLoaderClass();
                } else {
                  // var loader = XHRLoader;
                }
                var engine = new p2pml.hlsjs.Engine();
                this.player = new Clappr.Player({
                  parentId: "#video",
                  source: `https://8hgykwywuw.medianetwork.cloud/live/${data.stream._id}/index.m3u8`,
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
                console.log("url:", `${environment.apiURL}/live/${this.streamer.stream._id}/index.m3u8`)
              });

          })
      }

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


    })

  }

  getCategories() {
    console.log("get categoires called")
    this.http.get(`${environment.apiURL}/categories`).subscribe((data: { categories }) => {
      this.categories = data.categories
      console.log(this.categories)
      // for (let category of this.categories){
      //   this.http.get(`${environment.apiURL}/category/${category._id}`).subscribe((data)=>{
      //     console.log(data)
      //   })
      // }
    })
  }

  goToCategory(categoryId,categoryName) {
    this.router.navigate(["category", categoryName], { state: { categoryId: `${categoryId}` } })

  }


  destroy() {
    if (this.player) {
      this.player.destroy()
    }
  }


  onAccountChange() {
    // this.destroy()
    this.destroy()
    this.followedStreamers()
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
