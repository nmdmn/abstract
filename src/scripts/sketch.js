import * as Dat from "dat.gui";
import * as Three from "three";

import { App, UI } from "./app.js";

import * as Shaders from "./shaders/*/{v,f}_*.glsl";

function getShader(name, type) {
  return Shaders[name][type][name];
}

//const ui = {};

export default class Sketch {
  constructor(canvas) {
    //this.gui = new UI(ui);

    const mouse = new Three.Vector4(0., 0., -1., 0.);

    const camera = new Three.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const app = new App(canvas, camera);
    const uniforms = {
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
    const shaderName = "basic";
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
      uniforms: uniforms,
      vertexShader: getShader(shaderName, "v"),
      fragmentShader: getShader(shaderName, "f"),
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
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      mouse.z = 1.;
    });
    window.addEventListener("mouseout", (event) => {
      mouse.z = -1.;
    });

    app.addUpdateCallback((deltaTime, elapsedTime) => {
      uniforms.general.value.elapsedTime = elapsedTime;
      uniforms.general.value.deltaTime = deltaTime;
      uniforms.general.value.mouse.copy(mouse);
      uniforms.general.value.resolution = new Three.Vector2(window.innerWidth, window.innerHeight);
    });

    app.start();
  }
}
