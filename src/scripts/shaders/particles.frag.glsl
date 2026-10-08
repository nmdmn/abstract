varying float vAlpha;
varying float vWarmth;

void main() {
  float radius = length(gl_PointCoord - vec2(.5));
  if (radius > .5) discard;
  float core = 1.0 - smoothstep(.04, .46, radius);
  vec3 color = mix(vec3(.52, .37, .77), vec3(1.12, 1.02, .98), vWarmth);
  gl_FragColor = vec4(color, core * vAlpha);
}
