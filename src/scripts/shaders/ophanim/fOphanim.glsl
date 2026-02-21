struct general_params {
  float elapsedTime;
  float deltaTime;
  vec2 mousePos;
  vec2 resolution;
};
uniform general_params general;
varying vec2 vUv;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  // shadertoy uniform maps /////////////////////////////////////////////////////
  float iTime = general.elapsedTime;
  float iTimeDelta = general.deltaTime;
  vec4 iMouse = vec4(general.mousePos, 1., 1.);
  vec3 iResolution = vec3(general.resolution, 1.);
  ///////////////////////////////////////////////////////////////////////////////
  fragColor = vec4(0.);
}

void main() {
  vec2 fragCoord = vUv * 2. - 1.;
  fragCoord.x *= general.resolution.x / general.resolution.y;
  vec4 fragColor;
  mainImage(fragColor, fragCoord);
  gl_FragColor = vec4(fragColor.rgb, 1.);
}
