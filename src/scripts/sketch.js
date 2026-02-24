import * as Dat from "dat.gui";
import * as Three from "three";

import { App, UI } from "./app.js";

import VertexShader from "./shaders/limestone_cave/v_limestone_cave.glsl"
import FragmentShader from "./shaders/limestone_cave/f_limestone_cave.glsl"

//const ui = {};

export default class Sketch {
  constructor(canvas) {
    //this.gui = new UI(ui);

    const mouse = new Three.Vector4(window.innerWidth / 2., window.innerHeight / 2., 1., 1.);

    const camera = new Three.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const app = new App(canvas, camera);
    const uniforms = {
      iTime: { value: 0 },
      iTimeDelta: { value: 0 },
      iResolution: { value: new Three.Vector3(window.innerWidth, window.innerHeight, 1.) },
      iMouse: { value: mouse },
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
      uniforms: uniforms,
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
    });

    const mesh = new Three.Mesh(geometry, material);
    app.scene.add(mesh);

    app.addKeydownCallbacks((event) => {
      switch (event.key) {
        case "Escape":
          Dat.GUI.toggleHide();
          break;
      }
    });

    window.addEventListener("mousemove", (event) => {
      mouse.x = event.clientX;
      mouse.y = window.innerHeight - event.clientY;
    });

    app.addUpdateCallback((deltaTime, elapsedTime) => {
      uniforms.iTime.value = elapsedTime;
      uniforms.iTimeDelta.value = deltaTime;
      uniforms.iResolution.value = new Three.Vector2(window.innerWidth, window.innerHeight, 1.);
      uniforms.iMouse.value.copy(mouse);
    });

    app.start();
  }
}
