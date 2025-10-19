import * as Dat from "dat.gui";
import * as Three from "three";
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {CopyShader, OutputPass} from "three/examples/jsm/Addons.js";
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {HorizontalBlurShader} from 'three/examples/jsm/shaders/HorizontalBlurShader.js';
import {VerticalBlurShader} from 'three/examples/jsm/shaders/VerticalBlurShader.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {SSAOPass} from 'three/examples/jsm/postprocessing/SSAOPass.js';
import {FXAAPass} from 'three/examples/jsm/postprocessing/FXAAPass.js';

export class App {
  constructor(canvas, camera) {
    this.canvas = document.querySelector(canvas);
    this.camera = camera;
    this.scene = new Three.Scene();
    this.renderer = new Three.WebGLRenderer({
      canvas : this.canvas,
      antialias : true,
    });
    this.blurRenderTarget = new Three.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    this.blurRenderTarget.toneMapping = Three.ACESFilmicToneMapping;
    this.blurRenderTarget.outputColorSpace = Three.SRGBColorSpace;
    this.composer = new EffectComposer(this.renderer);
    this.onResize();

    this.renderer.toneMapping = Three.ACESFilmicToneMapping;
    //this.renderer.toneMapping = Three.ReinhardToneMapping;
    this.renderer.outputColorSpace = Three.SRGBColorSpace;
    this.renderer.setClearColor(0x000000);

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.outputPass = new OutputPass();
    this.bloomPass = new UnrealBloomPass(new Three.Vector2(window.innerWidth, window.innerHeight), 1.5, .4, .85);
    this.ssaoPass = new SSAOPass(this.scene, this.camera, window.innerWidth, window.innerHeight);
    this.fxaaPass = new FXAAPass();
    this.composer.addPass(this.renderPass);
    
    this.MAX_GLASSES = 8;
    const rectArray = [];
    for (let i = 0; i < this.MAX_GLASSES; i++) rectArray.push(new Three.Vector4());
    this.maskPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        tBlur: { value: null },
        rects: { value: rectArray},
        rectCount: { value: 0 },
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
      uniform sampler2D tDiffuse;
      uniform sampler2D tBlur;
      uniform vec4 rects[${this.MAX_GLASSES}];
      uniform int rectCount;
      varying vec2 vUv;

      // How soft the edge is — tweak as you like
      const float edgeSoftness = 0.01; // in UV units (~1% of screen width)

      void main() {
        vec4 sceneColor = texture2D(tDiffuse, vUv);
        vec4 blurColor = texture2D(tBlur, vUv);
        
        float mask = 0.0;

        for (int i = 0; i < ${this.MAX_GLASSES}; i++) {
          if (i >= rectCount) break;

          vec4 r = rects[i];
          // compute soft falloff
          float insideX = smoothstep(r.x, r.x + edgeSoftness, vUv.x) *
                          smoothstep(r.x + r.z, r.x + r.z - edgeSoftness, vUv.x);
          float insideY = smoothstep(r.y, r.y + edgeSoftness, vUv.y) *
                          smoothstep(r.y + r.w, r.y + r.w - edgeSoftness, vUv.y);
          
          float localMask = insideX * insideY;
          mask = max(mask, localMask); // union of all glass areas
        }

        gl_FragColor = mix(sceneColor, blurColor, mask);
      }

      `,
    });
    this.composer.addPass(this.maskPass);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(this.outputPass);

    this.hBlurPass = new ShaderPass(HorizontalBlurShader);
    this.vBlurPass = new ShaderPass(VerticalBlurShader);
    this.blurComposer = new EffectComposer(this.renderer, this.blurRenderTarget);
    this.blurComposer.addPass(this.renderPass);
    this.blurComposer.addPass(this.hBlurPass);
    this.blurComposer.addPass(new ShaderPass(CopyShader));
    this.blurComposer.addPass(this.vBlurPass);
    this.blurComposer.addPass(this.outputPass);


    this.clock = new Three.Clock();
    this.resizeCallbacks = [];
    this.keydownCallbacks = [];
    this.updateCallbacks = [];

    window.addEventListener("resize", () => { this.onResize(); }, false);
    window.addEventListener("keydown", event => { this.onKey(event); });
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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.blurRenderTarget.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
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

    this.blurComposer.render();

    this.maskPass.uniforms.tBlur.value = this.blurRenderTarget.texture;
    const glassDivs = document.querySelectorAll(".glass");
    let rectCount = 0;
    for (let i = 0; i < glassDivs.length && i < this.MAX_GLASSES; i++) {
      const rect = glassDivs[i].getBoundingClientRect();
      const x = rect.left / window.innerWidth;
      const y = rect.top / window.innerHeight;
      const w = rect.width / window.innerWidth;
      const h = rect.height / window.innerHeight;

      this.maskPass.uniforms.rects.value[i].set(x, 1.0 - y - h, w, h);
      rectCount++;
    }
    this.maskPass.uniforms.rectCount.value = rectCount;
    this.composer.render();

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
        this.gui.addColor(uiItem, "value").name(uiItemName)
        ;
      }
      if (uiItem.hasOwnProperty("listen") && uiItem.listen) {
        this.gui.add(uiItem, "value", uiItem.min, uiItem.max, uiItem.step).name(uiItemName).listen();
      } else {
        this.gui.add(uiItem, "value", uiItem.min, uiItem.max, uiItem.step).name(uiItemName)
      }
    }
  }
}
