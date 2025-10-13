attribute float noise;

uniform float time;
uniform float deltaTime;
uniform float scroll;
uniform float alpha;

void main() {
  vec4 worldPosition = modelViewMatrix * vec4(position, 1.);
  gl_PointSize = (300. * noise * (1. / -worldPosition.z)) + 15.;
  gl_Position = projectionMatrix * worldPosition;
}
