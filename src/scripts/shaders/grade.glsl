uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec3 color = texture2D(tDiffuse, vUv).rgb;
  vec2 center = mix(vec2(.73, .54), vec2(.5, .67), smoothstep(2.0, 3.0, uProgress));
  vec2 delta = vUv - center;
  delta.x *= uResolution.x / uResolution.y;
  float haze = exp(-dot(delta, delta) * 3.3);
  color += vec3(.003, .0018, .006) * haze;
  float vignette = 1.0 - smoothstep(.18, .85, length(vUv - .5));
  color *= .79 + .21 * vignette;
  float grain = hash(gl_FragCoord.xy + fract(uTime * .01) * 100.0) - .5;
  color += grain * .0015;
  gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
}
