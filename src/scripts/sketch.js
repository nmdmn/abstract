import * as Dat from "dat.gui";
import * as Three from "three";
import {Vector3} from "three";

import {App, UI} from "./app.js";
import {Box} from "./box";
import {Grid} from "./grid.js";

const ui = {
  alpha : {
    value : .33,
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
    this.camera.position.copy(new Vector3(-36, -43, 49));
    this.app = new App(canvas, this.camera);

    this.box = new Box(this.app, ui);
    this.grid = new Grid(this.app, ui);
    this.grid.mesh.position.copy(new Vector3(18, 21, 10));

    this.app.addKeydownCallbacks((event) => {
      switch (event.key) {
        case "Escape":
          Dat.GUI.toggleHide();
          break;
      }
    });

    this.app.start();
  }
}
