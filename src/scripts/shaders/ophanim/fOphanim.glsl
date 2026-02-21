struct general_params {
  float elapsedTime;
  float deltaTime;
  vec2 mousePos;
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

float map(vec3 p) {
  return length(p) - 1.; //distance to sphere radius 1.
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  // shadertoy uniform maps /////////////////////////////////////////////////////
  float iTime = general.elapsedTime;
  float iTimeDelta = general.deltaTime;
  vec4 iMouse = vec4(general.mousePos, 1., 1.);
  vec3 iResolution = vec3(general.resolution, 1.);
  ///////////////////////////////////////////////////////////////////////////////
  
  vec2 uv = (fragCoord * 2. - iResolution.xy) / iResolution.y;

  // init
  vec3 ro = vec3(0., 0., -3.); // ray origin
  vec3 rd = normalize(vec3(uv, 1.)); // ray direction
  vec3 c = vec3(0.);

  float t = 0.;

  const float max_step = 80.;
  // raymarch
  for (float i = 0.; i < max_step; i++) {
    vec3 p = ro + rd * t; // position along the ray

    float d = map(p); //current distance to the scene

    t += d; // "march"
    
    //c = vec3(i) / max_step; //coloring with the iter. count

    if (d < .001 || t > 100.) break;
  }

  c = vec3(t * .2); //coloring with the z-buffer

  fragColor = vec4(c, 1.);
}

void main() {
  //mimic shadertoy fragCoord input vector
  vec2 fragCoord = vUv * general.resolution.xy;
  vec4 fragColor;
  mainImage(fragColor, fragCoord);
  gl_FragColor = fragColor;
}
