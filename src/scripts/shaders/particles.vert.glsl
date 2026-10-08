
uniform vec2 uResolution;
attribute vec3 aSeed;
varying float vAlpha;
varying float vWarmth;

void main() {
  vec3 p = matter(uv);
  float settling = smoothstep(2.4, 3.0, uProgress);
  float scatter = smoothstep(1.1, 2.0, uProgress) * (1.0 - smoothstep(2.0, 3.0, uProgress));
  vec3 offset = (aSeed - .5) * vec3(4.0, 3.5, 5.0);
  p += offset * scatter * mix(.04, 1.0, pow(aSeed.z, 1.6));
  // Follow the surface normal, not the origin's radial direction. Independent
  // drift begins only during dissolution so points can't cross the solid skin.
  p += matterNormal(uv) * mix(.06, .018, settling);
  p += vec3(sin(uTime * .3 + aSeed.x * 30.0), cos(uTime * .25 + aSeed.y * 25.0), sin(uTime * .2 + aSeed.z * 20.0)) * scatter * .12;
  p.y += uVelocity * scatter * (aSeed.x - .5) * .75;
  vec4 view = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * view;
  float size = mix(.65, 1.65, aSeed.z);
  gl_PointSize = clamp(size * uResolution.y * .027 / max(1.0, -view.z), 1.0, 4.0) * mix(1.0, .7, settling);
  vAlpha = mix(.15, .64, aSeed.z) * mix(.7, 1.0, scatter);
  vAlpha *= mix(1.0, .35, settling);
  vWarmth = aSeed.x;
}
