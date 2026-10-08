
varying vec3 vNormal;
varying vec3 vView;
varying vec2 vUv;

void main() {
  vec3 p = matter(uv);
  vec3 normal = matterNormal(uv);
  vec4 view = modelViewMatrix * vec4(p, 1.0);
  vec3 viewNormal = normalMatrix * normal;
  vNormal = viewNormal * inversesqrt(max(dot(viewNormal, viewNormal), .00000001));
  vView = -view.xyz;
  vUv = uv;
  gl_Position = projectionMatrix * view;
}
