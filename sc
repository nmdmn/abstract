struct general_params {
  float elapsedTime;
  float deltaTime;
  vec2 mouse;
  vec2 resolution;
};
uniform general_params general;
varying vec2 vUv;

vec3 gold_palette(in float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 0.5);
  vec3 d = vec3(0.80, 0.90, 0.30);

  return a + b*cos( 6.283185*(c*t+d) );
}

vec3 bronze_palette(in float t) {
  vec3 a = vec3(0.8, 0.5, 0.4);
  vec3 b = vec3(0.2, 0.4, 0.2);
  vec3 c = vec3(2.0, 1.0, 1.0);
  vec3 d = vec3(0.00, 0.25, 0.25);

  return a + b*cos( 6.283185*(c*t+d) );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  // shadertoy uniform maps /////////////////////////////////////////////////////
  float iTime = general.elapsedTime;
  float iTimeDelta = general.deltaTime;
  vec4 iMouse = vec4(general.mouse, 1., 1.);
  vec3 iResolution = vec3(general.resolution, 1.);
  ///////////////////////////////////////////////////////////////////////////////

  vec2 uv = (fragCoord * 2. - iResolution.xy) / iResolution.y;

  float d = length(uv);

  d = abs(d);
  d = smoothstep(.495, .5 , d);

  fragColor = vec4(vec3(d), 1.);
}

void main() {
  //mimic shadertoy fragCoord input vector
  vec2 fragCoord = vUv * general.resolution.xy;
  vec4 fragColor;
  mainImage(fragColor, fragCoord);
  gl_FragColor = fragColor;
}
