import * as Three from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import GradeShader from "./shaders/grade.glsl";

export class App {
  constructor(canvas, camera) {
    this.canvas = document.querySelector(canvas);
    this.camera = camera;
    this.scene = new Three.Scene();
    this.updateCallbacks = [];
    this.resizeCallbacks = [];
    this.animate = true;
    this.frame = null;
    this.time = 0;
    this.previousTime = performance.now();
    this.renderer = new Three.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x010102);
    this.renderer.toneMapping = Three.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.outputColorSpace = Three.SRGBColorSpace;

    this.composer = new EffectComposer(this.renderer);
    this.bloomPass = new UnrealBloomPass(new Three.Vector2(), .32, .65, .85);
    this.gradePass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uResolution: { value: new Three.Vector2() },
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: GradeShader,
    });
    this.composer.addPass(new RenderPass(this.scene, camera));
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(this.gradePass);
    this.composer.addPass(new OutputPass());
    this.tick = this.tick.bind(this);
    this.onResize();

    window.addEventListener("resize", () => this.onResize());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(this.frame);
        this.frame = null;
      } else {
        this.previousTime = performance.now();
        this.invalidate();
      }
    });
    this.canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      this.contextLost = true;
      cancelAnimationFrame(this.frame);
      this.frame = null;
      document.body.classList.add("webgl-unavailable");
    });
    this.canvas.addEventListener("webglcontextrestored", () => {
      this.contextLost = false;
      document.body.classList.remove("webgl-unavailable");
      this.onResize();
      this.invalidate();
    });
  }

  addUpdateCallback(callback) { this.updateCallbacks.push(callback); }
  addResizeCallback(callback) { this.resizeCallbacks.push(callback); }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, this.width < 700 ? 1.25 : 1.5);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.composer.setPixelRatio(this.pixelRatio);
    this.composer.setSize(this.width, this.height);
    this.gradePass.uniforms.uResolution.value.set(this.width * this.pixelRatio, this.height * this.pixelRatio);
    this.resizeCallbacks.forEach(callback => callback());
    this.invalidate();
  }

  setAnimation(enabled) {
    this.animate = enabled;
    this.invalidate();
  }

  invalidate() {
    if (this.frame === null && !document.hidden && !this.contextLost) this.frame = requestAnimationFrame(this.tick);
  }

  tick(now) {
    this.frame = null;
    const delta = Math.min((now - this.previousTime) / 1000, .05);
    this.previousTime = now;
    if (this.animate) this.time += delta;
    this.updateCallbacks.forEach(callback => callback(delta, this.time));
    this.gradePass.uniforms.uTime.value = this.time;
    this.composer.render(delta);
    if (this.animate) this.invalidate();
  }

  start() {
    document.body.classList.add("webgl-ready");
    this.invalidate();
  }
}
