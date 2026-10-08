import * as Three from "three";
import FormShader from "./shaders/form.glsl";
import SurfaceVertex from "./shaders/surface.vert.glsl";
import SurfaceFragment from "./shaders/surface.frag.glsl";
import ParticleVertex from "./shaders/particles.vert.glsl";
import ParticleFragment from "./shaders/particles.frag.glsl";

// Repeatable particles: reversing the scroll reconstructs the very same object.
function randomGenerator() {
  let seed = 28471;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export default class Sculpture {
  constructor(app) {
    this.app = app;
    this.uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uVelocity: { value: 0 },
      uResolution: { value: new Three.Vector2() },
    };
    this.group = new Three.Group();
    app.scene.add(this.group);

    const mobile = window.innerWidth < 700;
    const surfaceGeometry = new Three.PlaneGeometry(1, 1, mobile ? 180 : 280, mobile ? 96 : 128);
    const surfaceMaterial = new Three.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: FormShader + SurfaceVertex,
      fragmentShader: SurfaceFragment,
      side: Three.DoubleSide,
    });
    this.surface = new Three.Mesh(surfaceGeometry, surfaceMaterial);
    this.surface.frustumCulled = false;
    this.group.add(this.surface);

    const random = randomGenerator();
    const count = mobile ? 14000 : 34000;
    const positions = new Float32Array(count * 3);
    const uv = new Float32Array(count * 2);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      uv[i * 2] = random();
      // A few orderly strands remain visible inside the otherwise organic cloud.
      uv[i * 2 + 1] = i % 4 === 0 ? Math.floor(random() * 12) / 12 : random();
      seeds[i * 3] = random();
      seeds[i * 3 + 1] = random();
      seeds[i * 3 + 2] = random();
    }
    const particleGeometry = new Three.BufferGeometry();
    particleGeometry.setAttribute("position", new Three.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("uv", new Three.BufferAttribute(uv, 2));
    particleGeometry.setAttribute("aSeed", new Three.BufferAttribute(seeds, 3));
    const particleMaterial = new Three.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: FormShader + ParticleVertex,
      fragmentShader: ParticleFragment,
      transparent: true,
      blending: Three.AdditiveBlending,
      depthWrite: false,
    });
    this.particles = new Three.Points(particleGeometry, particleMaterial);
    this.particles.frustumCulled = false;
    this.group.add(this.particles);

    const dustCount = mobile ? 450 : 1100;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPositions.set([(random() - .5) * 38, (random() - .5) * 26, -4 - random() * 18], i * 3);
      dustSizes[i] = random();
    }
    const dustGeometry = new Three.BufferGeometry();
    dustGeometry.setAttribute("position", new Three.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute("aSize", new Three.BufferAttribute(dustSizes, 1));
    this.dust = new Three.Points(dustGeometry, new Three.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        attribute float aSize;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.y += sin(uTime * .08 + position.x) * .08;
          vec4 view = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * view;
          gl_PointSize = clamp((.4 + aSize) * uResolution.y * .025 / -view.z, 1.0, 2.5);
          vAlpha = .07 + aSize * .19;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float radius = length(gl_PointCoord - .5);
          float alpha = (1.0 - smoothstep(.05, .5, radius)) * vAlpha;
          gl_FragColor = vec4(.61, .55, .71, alpha);
        }
      `,
      transparent: true,
      blending: Three.AdditiveBlending,
      depthWrite: false,
    }));
    app.scene.add(this.dust);
    this.resize();
  }

  resize() {
    this.uniforms.uResolution.value.set(this.app.width * this.app.pixelRatio, this.app.height * this.app.pixelRatio);
  }
}
