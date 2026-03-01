import * as Dat from "dat.gui";
import * as Three from "three";

import { App, UI } from "./app.js";

import VertexShader from "./shaders/ophanim/v_ophanim.glsl"
import FragmentShader from "./shaders/ophanim/f_ophanim.glsl"

//const ui = {};

export default class Sketch {
  constructor(canvas) {
    //this.gui = new UI(ui);
    const mouse = new Three.Vector2(0., 0.);

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
      fog: false,
      wireframe: false,
      transparent: false,
      depthTest: false,
      depthWrite: false,
      extensions: {
        derivates: "#extensions GL_OES_standard_derivates : enable",
        fragDepth: false,
        drawBuffers: false,
        haderTextureLOD: false,
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
    });

    const captureRate = 30;
    var captureFrame = 0;
    const isCapture = true;

    this.app.addUpdateCallback((deltaTime, elapsedTime) => {
      if (isCapture) {
        this.uniforms.general.value.elapsedTime = captureFrame / captureRate;
        this.uniforms.general.value.deltaTime = 1. / captureRate;

        var r = new XMLHttpRequest();
        r.open("POST", "http://localhost:1337/" + captureFrame);
        r.send(this.app.renderer.domElement.toDataURL().substr("data:image/png;base64,".length));

        captureFrame++;
      } else {
        this.uniforms.general.value.elapsedTime = elapsedTime;
        this.uniforms.general.value.deltaTime = deltaTime;
      }

      this.uniforms.general.value.mouse.copy(mouse);
      this.uniforms.general.value.resolution = new Three.Vector2(window.innerWidth, window.innerHeight);
    });

    this.app.start();
  }
}
