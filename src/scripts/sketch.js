import * as Dat from "dat.gui";
import * as Three from "three";

import { App, UI } from "./app.js";

import VertexShader from "./shaders/basic/v_basic.glsl.glsl"
import FragmentShader from "./shaders/basic/f_basic.glsl.glsl"

const ui = {
};

export default class Sketch {
  constructor(canvas) {
    //this.gui = new UI(ui);

    const mouse = new Three.Vector4(0., 0., -1., 0.);

    this.camera = new Three.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    this.app = new App(canvas, this.camera);
    this.uniforms = {
      general: {
        value: {
          elapsedTime: 0,
          deltaTime: 0,
          mouse: mouse,
          resolution: new Three.Vector2(window.innerWidth, window.innerHeight),
        }
      },
    };
    const geometry = new Three.PlaneGeometry(2, 2);
    const material = new Three.ShaderMaterial({
      side: Three.FrontSide,
      blending: Three.AdditiveBlending,
      clipping: true,
      fog: true,
      wireframe: false,
      transparent: true,
      depthTest: true,
      depthWrite: true,
      extensions: {
        derivates: "#extensions GL_OES_standard_derivates : enable",
        fragDepth: true,
        drawBuffers: true,
        haderTextureLOD: true,
      },
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

    window.addEventListener("mousemove", (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      mouse.z = 1.;
    });
    window.addEventListener("mouseout", (event) => {
      mouse.z = -1.;
    });

    this.app.addUpdateCallback((deltaTime, elapsedTime) => {
      this.uniforms.general.value.elapsedTime = elapsedTime;
      this.uniforms.general.value.deltaTime = deltaTime;
      this.uniforms.general.value.mouse.copy(mouse);
      this.uniforms.general.value.resolution = new Three.Vector2(window.innerWidth, window.innerHeight);
    });

    this.app.start();
  }
}
