import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GlobalVarsService } from '../global-vars.service';
import { BackendApiService } from '../backend-api.service';


declare var p2pml: any;
declare var Clappr: any;

@Component({
  selector: 'app-category-view',
  templateUrl: './category-view.component.html',
  styleUrls: ['./category-view.component.scss']
})

export class CategoryViewComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private globalVars: GlobalVarsService, private backendApi: BackendApiService) { 
    console.log(this.router.getCurrentNavigation().extras.state.categoryId)
  }
  categoryID
  player
  anyoneLive = false
  categoryStreams
  streamerProfilePicture

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categoryID = params.get("category")
      this.getCategoryStreams();
      if (this.player) {
        this.player.destroy()
      }
    })
  }

  getCategoryStreams() {
    this.http.get(`http://149.159.16.161:3123/category/${this.categoryID}`).subscribe((data: { streams }) => {
      console.log('data', data);
      if (data.streams) {
        console.log('streams', data.streams)
        if (data.streams.length > 0) {
          this.categoryStreams = data.streams
          this.anyoneLive = true
          for (let i = 0; i < this.categoryStreams.length; i++) {
            this.backendApi.GetSingleProfilePicture(
              this.globalVars.localNode,
              this.categoryStreams[i].publicKey
            ).subscribe((res) => {
              this._readImageFileToProfilePicInput(res, i);
              if (p2pml.hlsjs.Engine.isSupported()) {
                var engine = new p2pml.hlsjs.Engine();
                var loader = engine.createLoaderClass();
              } else {
                // var loader = XHRLoader;
                console.log("in else blockl")
              }
              console.log('stream id', this.categoryStreams[0]._id)
              var engine = new p2pml.hlsjs.Engine();
              console.log('url', `http://149.159.16.161:8082/live/${this.categoryStreams[0]._id}/index.m3u8`)
              this.player = new Clappr.Player({
                parentId: "#video",
                source: `http://149.159.16.161:8082/live/${this.categoryStreams[0]._id}/index.m3u8`,
                width: "100%",
                height: "100%",
                playback: {
                  hlsjsConfig: {
                    liveSyncDurationCount: 7,
                    loader: loader
                  }
                }
              });
              console.log('player', this.player)
              if (p2pml.hlsjs.Engine.isSupported()) p2pml.hlsjs.initClapprPlayer(this.player);
              this.player.play(true);
            })
          }
        } else {
          this.router.navigate([this.globalVars.RouteNames.NOT_FOUND])
        }
      } else {
        console.log("NOT STREAMS")
      }
    })
  }

  onAccountChange() {

  }

  _readImageFileToProfilePicInput(file: Blob | File, i) {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event: any) => {
      const base64Image = btoa(event.target.result);
      this.categoryStreams[i].profilePicture = `data:${file.type};base64,${base64Image}`;
      console.log(this.categoryStreams)
    };
  }
}
