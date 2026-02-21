import * as Dat from "dat.gui";
import * as Three from "three";

import { App, UI } from "./app.js";

import VertexShader from "./shaders/ophanim/vOphanim.glsl"
import FragmentShader from "./shaders/ophanim/fOphanim.glsl"

const ui = {
  exposure: {
    value: 1.,
    min: .1,
    max: 2.,
    step: .01,
  },
  threshold: {
    value: .0,
    min: .0,
    max: 1.,
    step: .01,
  },
  strength: {
    value: .0,
    min: .0,
    max: 3.,
    step: .1,
  },
  radius: {
    value: .0,
    min: .0,
    max: 1.,
    step: .01,
  },
};

export default class Sketch {
  constructor(canvas) {
    this.gui = new UI(ui);

    this.camera = new Three.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    this.app = new App(canvas, this.camera);
    this.uniforms = {
      general: {
        value: {
          elapsedTime: 0,
          deltaTime: 0,
          mousePos: new Three.Vector2(.5, .5),
          resolution: new Three.Vector2(window.innerWidth, window.innerHeight),
        }
      },
    };
    const geometry = new Three.PlaneGeometry(2, 2);
    const material = new Three.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
    });

    this.mesh = new Three.Mesh(geometry, material);
    this.app.scene.add(this.mesh);

    this.app.addKeydownCallbacks((event) => {
      switch (event.key) {
        case "Escape":
          Dat.GUI.toggleHide();
          break;
      }
    });

    const mouse = new Three.Vector2();
    window.addEventListener("mousemove", (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    this.app.addUpdateCallback((deltaTime, elapsedTime) => {
      this.uniforms.general.value.elapsedTime = elapsedTime;
      this.uniforms.general.value.deltaTime = deltaTime;
      this.uniforms.general.value.mousePos.copy(mouse).multiplyScalar(.26);
      this.uniforms.general.value.resolution = new Three.Vector2(window.innerWidth, window.innerHeight);
      this.app.renderer.toneMappingExposure = Math.pow(ui.exposure.value, 4);
      this.app.bloomPass.threshold = ui.threshold.value;
      this.app.bloomPass.strength = ui.strength.value;
      this.app.bloomPass.radius = ui.radius.value;
    });

    this.app.start();
  }
}
