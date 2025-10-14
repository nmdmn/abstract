import * as Dat from "dat.gui";
import * as Three from "three";
import {Vector3} from "three";

import {App, UI} from "./app.js";
import {Box} from "./box";
import {Grid} from "./grid.js";

const ui = {
  alpha : {
    value : .75,
    min : .0,
    max : 1.,
    step : .01,
  },
  exposure : {
    value : .75,
    min : .1,
    max : 2.,
    step : .01,
  },
  threshold : {
    value : .4,
    min : .0,
    max : 1.,
    step : .01,
  },
  strength : {
    value : .5,
    min : .0,
    max : 3.,
    step : .1,
  },
  radius : {
    value : .8,
    min : .0,
    max : 1.,
    step : .01,
  },
};

export default class Sketch {
  constructor(canvas) {
    this.gui = new UI(ui);

    this.camera = new Three.PerspectiveCamera(33, window.innerWidth / window.innerHeight, .1, 1000.);
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.camera.position.copy(new Vector3(0, 0, 56));
    this.app = new App(canvas, this.camera);

    this.box = new Box(this.app, ui);
    this.grid = new Grid(this.app, ui);
    this.grid.mesh.position.copy(new Vector3(0, 0, -10));

    this.app.addKeydownCallbacks((event) => {
      switch (event.key) {
        case "Escape":
          Dat.GUI.toggleHide();
          break;
      }
    });

    this.app.addUpdateCallback(() => {
      this.app.renderer.toneMappingExposure = Math.pow(ui.exposure.value, 4);
      this.app.bloomPass.threshold = ui.threshold.value;
      this.app.bloomPass.strength = ui.strength.value;
      this.app.bloomPass.radius = ui.radius.value;
    });

    this.app.start();
  }
}
