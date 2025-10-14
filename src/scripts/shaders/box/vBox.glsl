attribute float noise;

uniform float time;
uniform float deltaTime;
uniform float scroll;
uniform float alpha;

void main() {
  vec4 worldPosition = modelViewMatrix * vec4(position, 1.);
  gl_PointSize = (100. * noise * (1. / -worldPosition.z)) + 6.5;
  gl_Position = projectionMatrix * worldPosition;
}
