import * as Dat from "dat.gui";
import {Tween, Group, Easing} from "@tweenjs/tween.js";
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

    // EASING functions
    // https://tweenjs.github.io/tween.js/examples/03_graphs.html 
    const animCamIn = new Tween(this.camera.position)
      .to(new Vector3(0, -5, 30), 500)
      .easing(Easing.Quadratic.InOut)
      .start();
    const animCamOut = new Tween(this.camera.position)
      .to(new Vector3(0, 5, 130), 500)
      .easing(Easing.Sinusoidal.InOut);
    const animCamLeft = new Tween(this.camera.position)
      .to(new Vector3(-5.5, 0, 90), 500)
      .easing(Easing.Quadratic.InOut);
    const animCamBottom = new Tween(this.camera.position)
      .to(new Vector3(0, 15, 110), 500)
      .easing(Easing.Sinusoidal.InOut);

    const animExposureStrengthen = new Tween(ui)
      .to({
        aplha: {value: .7},
        exposure: {value: 1.2},
        threshold : {value: .2},
        strength : {value: .5},
        radius : {value: 1}},
        500)
      .easing(Easing.Exponential.InOut)
      .start();
    const animExposureWeaken = new Tween(ui)
      .to({
        alpha: {value: 1},
        exposure: {value: .8},
        threshold : {value: .6},
        strength : {value: .6},
        radius: {value : .9}},
        500)
      .easing(Easing.Exponential.InOut);

    const animations = new Group();
    animations.add(animCamOut);
    animations.add(animCamIn);
    animations.add(animCamLeft);
    animations.add(animCamBottom);

    animations.add(animExposureStrengthen);
    animations.add(animExposureWeaken);

    document.querySelector("main").addEventListener("scrollsnapchanging", event => {
      switch (event.snapTargetBlock.id) {
        case "section-0":
          animCamIn.startFromCurrentValues();
          animExposureStrengthen.startFromCurrentValues();
          break;
        case "section-1":
          animCamOut.startFromCurrentValues();
          animExposureWeaken.startFromCurrentValues();
          break;
        case "section-2":
          animCamLeft.startFromCurrentValues();
          animExposureWeaken.startFromCurrentValues();
          break;
        case "section-3":
          animCamBottom.startFromCurrentValues();
          animExposureWeaken.startFromCurrentValues();
          break;
      }
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
      this.gui.gui.updateDisplay();
      this.app.renderer.toneMappingExposure = Math.pow(ui.exposure.value, 4);
      this.app.bloomPass.threshold = ui.threshold.value;
      this.app.bloomPass.strength = ui.strength.value;
      this.app.bloomPass.radius = ui.radius.value;
    });

    this.app.start();
  }
}
