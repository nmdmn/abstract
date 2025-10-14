uniform float time;
uniform float deltaTime;
uniform float scroll;
uniform float alpha;

void main() {
  float mask = 1. - smoothstep(.3, .5, length(gl_PointCoord - vec2(.5)));
  gl_FragColor = vec4(1., 1., 1., alpha * mask);
}
