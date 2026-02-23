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

float smin( float a, float b, float k ) {
    k *= 1.0/(1.0-sqrt(0.5));
    float h = max( k-abs(a-b), 0.0 )/k;
    return min(a,b) - k*0.5*(1.0+h-sqrt(1.0-h*(h-2.0)));
}

mat2 rot2D(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

float sdSphere(vec3 p, float s) {
  return length(p) - s;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.);
}

float map(vec3 p) {
  vec3 spherePosition = vec3(sin(general.elapsedTime) * 1.5, 0., 0.);
  float sphere = sdSphere(p - spherePosition, 1.);

  vec3 q = p;
  q.xy *= rot2D(general.elapsedTime);
  float box = sdBox(q * 1.5, vec3(.75)) / 1.5;

  float ground = p.y + .75;

  return smin(ground, smin(sphere, box, .2), .1);
}

void main() {
  //setup clip space
  vec2 uv = (vUv * 2. - 1.) * vec2(general.resolution.x / general.resolution.y, 1.);
  vec2 m = general.mouse * vec2(general.resolution.x / general.resolution.y, 1.0);

  // init
  vec3 ro = vec3(0., 0., -3.); // ray origin
  vec3 rd = normalize(vec3(uv, 1.)); // ray direction
  vec3 c = vec3(0.);

  float t = 0.;

  // camera by mouse
  ro.yz *= rot2D(-m.y);
  rd.yz *= rot2D(-m.y);
  if (ro.y < -.5) ro.y = -.5;
  ro.xz *= rot2D(-m.x);
  rd.xz *= rot2D(-m.x);

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

  gl_FragColor = vec4(c, 1.);
}
