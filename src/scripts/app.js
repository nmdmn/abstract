import * as Dat from "dat.gui";
import * as Three from "three";
import {OrbitControls} from "three/examples/jsm/Addons.js";

export class App {
  constructor(canvas, camera) {
    this.canvas = document.querySelector(canvas);
    this.camera = camera;
    this.cameraControl = new OrbitControls(this.camera, this.canvas);
    this.scene = new Three.Scene();
    this.renderer = new Three.WebGLRenderer({
      canvas : this.canvas,
      antialias : true,
    });
    this.renderer.toneMapping = Three.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = Three.SRGBColorSpace;
    this.renderer.setClearColor(0x000000);

    this.onResize();
    window.addEventListener('resize', () => { this.onResize(); }, false);
    window.addEventListener('keydown', event => { this.onKey(event); });

    this.clock = new Three.Clock();
    this.resizeCallbacks = [];
    this.keydownCallbacks = [];
    this.updateCallbacks = [];
  }

  addResizeCallback(resizeCallback) { this.resizeCallbacks.push(resizeCallback); }
  addKeydownCallbacks(keydownCallback) { this.keydownCallbacks.push(keydownCallback); }
  addUpdateCallback(updateCallback) { this.updateCallbacks.push(updateCallback); }

  onResize() {
    for ( const callback in this.resizeCallbacks) {
      this.resizeCallbacks[callback]();
    }

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onKey(event) {
    for (const callback in this.keydownCallbacks) {
      this.keydownCallbacks[callback](event);
    }
  }

  tick() {
    for (const callback in this.updateCallbacks) {
      this.updateCallbacks[callback](this.clock.getDelta(), this.clock.getElapsedTime());
    }

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.tick.bind(this));
  }

  start() { this.tick(); }
}

export class BufferObject {
  constructor(size, numComponents) {
    this.dataArray = new Float32Array(size * numComponents);
    this.numComponents = numComponents;
    this.currentIt = 0;
  }

  add(data) {
    this.dataArray.set(data, this.currentIt);
    this.currentIt += this.numComponents;
  }
}

export class UI {
  constructor(elements) {
    this.gui = new Dat.GUI();
    this.gui.close();

    const uiSettingsPropNames = Object.getOwnPropertyNames(elements);
    for (let uiItemId in uiSettingsPropNames) {
      const uiItemName = uiSettingsPropNames[uiItemId];
      const uiItem = elements[uiItemName];
      if (uiItem.hasOwnProperty("type") && uiItem.type == "color") {
        this.gui.addColor(uiItem, "value").name(uiItemName);
      }
      if (uiItem.hasOwnProperty("listen") && uiItem.listen) {
        this.gui.add(uiItem, "value", uiItem.min, uiItem.max, uiItem.step).name(uiItemName).listen();
      } else {
        this.gui.add(uiItem, "value", uiItem.min, uiItem.max, uiItem.step).name(uiItemName)
      }
    }
  }
}
