import * as Three from "three";
import { App } from "./app.js";
import Sculpture from "./sculpture.js";

const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

const states = [
  { position: [2.55, .45, 0], rotation: [.4, -.45, -.35], scale: 1, camera: [0, 0, 12.8], target: [0, 0, 0] },
  { position: [2.3, .45, -.4], rotation: [.9, .2, .12], scale: 1.02, camera: [.15, .1, 13.8], target: [0, .1, 0] },
  { position: [3.1, .3, 0], rotation: [.12, -.35, .25], scale: 1, camera: [-.2, 0, 14.6], target: [0, 0, 0] },
  { position: [0, 2.6, 0], rotation: [.55, -.12, -.16], scale: .72, camera: [0, 0, 15.6], target: [0, 0, 0] },
];
const desktopPositions = states.map(state => state.position);
const mobilePositions = [[0, 2.05, 0], [.1, 2.15, -.4], [.4, 2.2, 0], [0, 2.75, 0]];
const bloomStrengths = [.3, .36, .38, .2];

export default class Sketch {
  constructor(canvas, timeline) {
    this.timeline = timeline;
    this.camera = new Three.PerspectiveCamera(40, window.innerWidth / window.innerHeight, .1, 100);
    this.camera.position.z = 12.8;
    this.app = new App(canvas, this.camera);
    this.sculpture = new Sculpture(this.app);
    this.pointer = new Three.Vector2();
    this.pointerTarget = new Three.Vector2();
    this.lookTarget = new Three.Vector3();
    this.mobile = window.innerWidth < 700;
    this.app.addResizeCallback(() => {
      this.mobile = window.innerWidth < 700;
      this.sculpture.resize();
    });

    window.addEventListener("pointermove", event => {
      if (event.pointerType !== "mouse" || !this.timeline.motionEnabled) return;
      this.pointerTarget.set(event.clientX / window.innerWidth - .5, event.clientY / window.innerHeight - .5);
    }, { passive: true });
    document.addEventListener("pointerleave", () => this.pointerTarget.set(0, 0));
    timeline.onChange(() => {
      this.app.setAnimation(timeline.motionEnabled);
      this.app.invalidate();
    });
    this.app.addUpdateCallback((delta, time) => this.update(delta, time));
    this.app.setAnimation(timeline.motionEnabled);
    this.app.start();
  }

  update(delta, time) {
    this.timeline.update(delta);
    const moving = this.timeline.motionEnabled;
    const progress = moving ? this.timeline.progress : Math.round(this.timeline.progress);
    const index = Math.min(2, Math.floor(progress));
    const mix = ease(progress - index);
    const from = states[index];
    const to = states[index + 1];
    const lerp = (a, b) => a + (b - a) * mix;
    const positions = this.mobile ? mobilePositions : desktopPositions;
    const object = this.sculpture.group;
    object.position.set(...positions[index].map((value, axis) => lerp(value, positions[index + 1][axis])));
    object.rotation.set(...from.rotation.map((value, axis) => lerp(value, to.rotation[axis])));
    object.rotation.x += moving ? Math.sin(time * .13) * .025 : 0;
    object.rotation.z += moving ? Math.sin(time * .09) * .025 : 0;
    const responsiveScale = this.mobile ? Math.min(.6, this.camera.aspect * .81) * Math.min(1, this.app.height / 650) : 1;
    object.scale.setScalar(lerp(from.scale, to.scale) * responsiveScale);
    if (this.mobile) object.position.y += Math.max(0, 1 - this.app.height / 650) * .8;

    if (moving) this.pointer.lerp(this.pointerTarget, 1 - Math.exp(-delta * 3));
    else this.pointer.set(0, 0);
    this.camera.position.set(...from.camera.map((value, axis) => lerp(value, to.camera[axis])));
    this.camera.position.x += this.pointer.x * .24;
    this.camera.position.y -= this.pointer.y * .17;
    this.lookTarget.set(...from.target.map((value, axis) => lerp(value, to.target[axis])));
    this.camera.lookAt(this.lookTarget);

    this.sculpture.uniforms.uProgress.value = progress;
    this.sculpture.uniforms.uTime.value = moving ? time : 0;
    this.sculpture.uniforms.uVelocity.value = moving ? this.timeline.velocity : 0;
    this.app.gradePass.uniforms.uProgress.value = progress;
    this.app.bloomPass.strength = lerp(bloomStrengths[index], bloomStrengths[index + 1]);
    this.sculpture.dust.rotation.z = moving ? Math.sin(time * .025) * .025 : 0;
  }
}
