import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import {p2pml, XHRLoader, Player} from "@clappr/core"


import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));

if (p2pml.hlsjs.Engine.isSupported()) {
  var engine = new p2pml.hlsjs.Engine();
  var loader = engine.createLoaderClass();
} else {
  var loader = XHRLoader;
}
var engine = new p2pml.hlsjs.Engine();
var player = new Player({
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




