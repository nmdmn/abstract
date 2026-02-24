struct general_params {
  float elapsedTime;
  float deltaTime;
  vec2 mouse;
  vec2 resolution;
};
uniform general_params general;
varying vec2 vUv;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  // shadertoy uniform maps ////////////////////////////////////////////////////
  float iTime = general.elapsedTime;
  float iTimeDelta = general.deltaTime;
  vec4 iMouse = vec4(general.mouse, 1., 1.);
  vec3 iResolution = vec3(general.resolution, 1.);
  //////////////////////////////////////////////////////////////////////////////
  // ±!@#$%^&*()_+ /////////////////////////////////////////////////////////////
  vec2 uv = (fragCoord * 2. - iResolution.xy) / iResolution.y;

  float d = length(uv);

  d = abs(d);
  d = smoothstep(.495, .5 , d);

  fragColor = vec4(vec3(d), 1.);
  //////////////////////////////////////////////////////////////////////////////
}

void main() {
  //mimic shadertoy fragCoord input vector
  vec2 fragCoord = vUv * general.resolution.xy;
  vec4 fragColor;
  mainImage(fragColor, fragCoord);
  gl_FragColor = fragColor;
}
