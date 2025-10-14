import * as Dat from "dat.gui";
import {Tween, Group} from "@tweenjs/tween.js";
import * as Three from "three";
import {Vector3} from "three";

import {App, UI} from "./app.js";
import {Box} from "./box";
import {Grid} from "./grid.js";

const ui = {
  alpha : {
    value : 1.,
    min : .0,
    max : 1.,
    step : .01,
  },
  exposure : {
    value : .8,
    min : .1,
    max : 2.,
    step : .01,
  },
  threshold : {
    value : .6,
    min : .0,
    max : 1.,
    step : .01,
  },
  strength : {
    value : .6,
    min : .0,
    max : 3.,
    step : .1,
  },
  radius : {
    value : .9,
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
    this.camera.position.copy(new Vector3(0, 0, 33));
    this.app = new App(canvas, this.camera);

    this.box = new Box(this.app, ui);
    this.grid = new Grid(this.app, ui);
    this.grid.mesh.position.copy(new Vector3(0, 0, -10));


    const animations = new Group();

    document.querySelector("main").addEventListener("scrollsnapchanging", (event) => {
      animations.removeAll();
      switch (event.snapTargetBlock.id) {
        case "section-0":
          animations.add(new Tween(this.camera.position)
            .to(new Vector3(0, 0, 33), 500)
            .start());
          break;
        case "section-1":
          animations.add(new Tween(this.camera.position)
            .to(new Vector3(0, 0, 99), 500)
            .start());
          break;
        case "section-2":
          animations.add(new Tween(this.camera.position)
            .to(new Vector3(-5, 0, 66), 500)
            .start());
          break;
        case "section-3":
          animations.add(new Tween(this.camera.position)
            .to(new Vector3(0, 10, 99), 500)
            .start());
          break;
      }
      console.log(animations);
    });

    this.app.addKeydownCallbacks((event) => {
      switch (event.key) {
        case "Escape":
          Dat.GUI.toggleHide();
          break;
      }
    });

    this.app.addUpdateCallback((deltaTime, time) => {
      animations.update();
      this.app.renderer.toneMappingExposure = Math.pow(ui.exposure.value, 4);
      this.app.bloomPass.threshold = ui.threshold.value;
      this.app.bloomPass.strength = ui.strength.value;
      this.app.bloomPass.radius = ui.radius.value;
    });

    this.app.start();
  }
}
