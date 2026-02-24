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

void main() {
  vec2 uv = (vUv * 2. - 1.) * vec2(general.resolution.x / general.resolution.y, 1.);
  vec2 uv0 = uv;

  vec3 oColor = vec3(0.);

  for(float i = 0.; i < 3.; i++) {
    uv = fract(uv * 1.5) - .5;

    float d0 = length(uv0);
    float d = length(uv) * exp(-d0);

    vec3 color = gold_palette(d * i / .4 + general.elapsedTime / 4.);

    d = sin(d * 8. + general.elapsedTime) / 8.;
    d = abs(d);

    d = pow(.01 / d, 1.2);
    oColor += color * d;
  }

  gl_FragColor = vec4(oColor, 1.);
}
