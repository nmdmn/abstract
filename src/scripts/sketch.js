import {Tween, Group, Easing} from "@tweenjs/tween.js";
import {createNoise3D} from "simplex-noise";
import * as Three from "three";
import {Euler, Vector3} from "three";

import {App, BufferObject} from "./app.js";
import FragmentShader from "./shaders/fDefault.glsl";
import VertexShader from "./shaders/vDefault.glsl";

export default class Sketch {
  constructor(args) {
    const settings = {
      camera : {
        fov : 63.,
        nearZ : .1,
        farZ : 1000.,
        rotation : new Euler(0., 0., 0.),
        position : new Vector3(1., 1., 1.), //NOTE immediately rewritten by TWEEN
      },
      ui : {
        alpha : {
          value : .33,
          min : .0,
          max : 1.,
          step : .01,
        }
      },
    };

    const app = new App(args, settings);
    const shader = this.initShader(app, settings);
    const geometry = this.initGeometry(5, 4);

    const mesh = new Three.Points(geometry, shader);
    app.scene.add(mesh);

//    const light = new Three.HemisphereLight(0xffffbb, 0x080820, 1);
//    app.scene.add(light);

    const from_choord = {x : 100, y : 100, z : 100};
    const to_choord = {x : 33, y : 33, z : 33};

    const coords1 = from_choord;
    const tween1 = new Tween(coords1)
      .to(to_choord, 3000)
      .easing(Easing.Quadratic.InOut) // NOTE https://sole.github.io/tween.js/examples/03_graphs.html
      .onUpdate(() => app.camera.position.set(coords1.x, coords1.y, coords1.z))
      .start();
    
    const coords2 = to_choord;
    const tween2 = new Tween(coords2)
      .to(from_choord, 3000)
      .easing(Easing.Quadratic.InOut) // NOTE https://sole.github.io/tween.js/examples/03_graphs.html
      .onUpdate(() => app.camera.position.set(coords2.x, coords2.y, coords2.z))
      .start(6000);

    const tweenGroup = new Group();
    tweenGroup.add(tween1, tween2);

    app.setUpdateCallback(dT => {
      const time = app.clock.getElapsedTime();
      mesh.rotateX(Math.cos(Math.PI * time * dT) / 100);
      mesh.rotateZ(Math.cos(Math.PI * time * dT) / 300);
      shader.uniforms["time"].value = time;
      shader.uniforms["scroll"].value = window.scrollY;
      shader.uniforms["alpha"].value = settings.ui.alpha.value;
      tweenGroup.update();
    });

    app.start();
  }

  initShader(app, settings) {
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
        time : {type : "f", value : app.clock.getElapsedTime()},
        scroll : {type : "f", value : window.scrollY},
        alpha : {type : "f", value : settings.ui.alpha.value},
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
