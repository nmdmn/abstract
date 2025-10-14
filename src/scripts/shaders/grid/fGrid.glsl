uniform float time;
uniform float deltaTime;
uniform float scroll;
uniform float alpha;

varying vec2 vUv;
varying float vNoise;
varying vec3 vPos;

vec3 coldColor = vec3(.0, .0, .0);
vec3 hotColor = vec3(1., 1., 1.);

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {
  float rounding = 1. - smoothstep(-.5, .5, length(gl_PointCoord - vec2(.5)));
  gl_FragColor =
      vec4(mix(coldColor, hotColor, vNoise * vPos.z + .5), rounding * (alpha / 2.));
}
