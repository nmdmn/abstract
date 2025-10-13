import * as Dat from "dat.gui";
import {createNoise3D} from "simplex-noise";
import * as Three from "three";
import {Vector3} from "three";

import {App, UI, BufferObject} from "./app.js";
import FragmentShader from "./shaders/fDefault.glsl";
import VertexShader from "./shaders/vDefault.glsl";

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
    this.camera.position.copy(new Vector3(99, 99, 99));
    this.app = new App(canvas, this.camera);

    this.dottedBox = new DottedBoxModel(this.app);

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

class DottedBoxModel {
  constructor(app) {
    this.app = app;
    this.shader = this.initShader();
    this.geometry = this.initGeometry(5, 4);

    this.mesh = new Three.Points(this.geometry, this.shader);
    this.app.scene.add(this.mesh);

    this.app.addUpdateCallback((deltaTime, time) => {
      this.mesh.rotation.x = ((time % 20) / 20) * (Math.PI * 2);
      this.mesh.rotation.z = ((time % 30) / 30) * (Math.PI * 2);
      this.shader.uniforms["time"].value = time;
      this.shader.uniforms["deltaTime"].value = deltaTime;
      this.shader.uniforms["scroll"].value = window.scrollY;
      this.shader.uniforms["alpha"].value = ui.alpha.value;
    });
  }

  initShader() {
    return new Three.ShaderMaterial({
      side : Three.DoubleSide,
      clipping : true,
      fog : false,
      wireframe : false,
      blending : Three.AdditiveBlending,
      transparent : true,
      depthWrite : false,
      extensions : {
        derivates : "#extensions GL_OES_standard_derivates : enable",
        // fragDepth : false,
        // drawBuffers : true,
        // shaderTextureLOD : false,
      },
      uniforms : {
        time : {type : "f", value : this.app.clock.getElapsedTime()},
        deltaTime : {type : "f", value : this.app.clock.deltaTime},
        scroll : {type : "f", value : window.scrollY},
        alpha : {type : "f", value : ui.alpha.value},
      },
      vertexShader : VertexShader,
      fragmentShader : FragmentShader,
    });
  }

  initGeometry(size, resolution) {
    const unit = size / resolution;
    const numVertices = resolution ** 3;                  // NOTE its a cube
    const positionVBO = new BufferObject(numVertices, 3); // NOTE 3d positions, num of comps per vertex is 3
    const noiseVBO = new BufferObject(numVertices, 1);    // NOTE its a single float normalized
    const sampler = new createNoise3D();
    for (let nY = 0; nY < resolution; nY++) {
      for (let nZ = 0; nZ < resolution; nZ++) {
        for (let nX = 0; nX < resolution; nX++) {
          const x = (nX + .5) * unit - size / 2;
          const y = (nY + .5) * unit - size / 2;
          const z = (nZ + .5) * unit - size / 2;
          positionVBO.add([ x, y, z ]);
          noiseVBO.add([ sampler(x, y, z) ]);
        }
      }
    }
    return new Three.BufferGeometry()
      .setAttribute("position", new Three.BufferAttribute(positionVBO.dataArray, positionVBO.numComponents))
      .setAttribute("noise", new Three.BufferAttribute(noiseVBO.dataArray, noiseVBO.numComponents));
  }
}
