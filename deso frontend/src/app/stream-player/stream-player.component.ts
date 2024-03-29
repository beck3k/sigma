import { Component, OnInit, Input } from '@angular/core';
declare var p2pml: any;
declare var Clappr: any;

@Component({
  selector: 'app-stream-player',
  templateUrl: './stream-player.component.html',
  styleUrls: ['./stream-player.component.scss']
})
export class StreamPlayerComponent implements OnInit {
  constructor() { }
  player
  @Input() streamId

  ngOnInit(): void {
    if (p2pml.hlsjs.Engine.isSupported()) {
      var engine = new p2pml.hlsjs.Engine();
      var loader = engine.createLoaderClass();
    } else {
      // var loader = XHRLoader;
    }
    try {
      var engine = new p2pml.hlsjs.Engine();
      this.player = new Clappr.Player({
        parentId: "#video",
        source: `http://ec2-18-216-128-152.us-east-2.compute.amazonaws.com/live/${this.streamId}/index.m3u8`,
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
    } catch (error) { console.log(error) }
  }

}
