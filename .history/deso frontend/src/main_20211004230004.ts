import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import Clappr from '@clappr/core'

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));


	var playerElement = document.querySelector(".player");
	var player = new Clappr.Player({
		source: "http://149.159.16.161:8082/live/615bba8d7db93bbee3d42621/index.m3u8",
		parent: playerElement,
	});

