uniform float uProgress;
varying vec3 vNormal;
varying vec3 vView;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

vec3 safeNormalize(vec3 value) {
  float magnitudeSquared = dot(value, value);
  return magnitudeSquared > .00000001 ? value * inversesqrt(magnitudeSquared) : vec3(0.0, 0.0, 1.0);
}

void main() {
  float presence = 1.0 - smoothstep(1.15, 1.95, uProgress);
  presence += .65 * smoothstep(2.65, 3.0, uProgress);

  vec3 n = safeNormalize(vNormal);
  if (!gl_FrontFacing) n = -n;
  vec3 eye = safeNormalize(vView);
  vec3 light = safeNormalize(vec3(-.8, 1.2, 1.7));
  vec3 secondLight = safeNormalize(vec3(1.2, -.5, .7));
  float diffuse = max(dot(n, light), 0.0);
  // Normalized float vectors can still have a dot product slightly above 1.
  // A negative base with a fractional exponent produces NaN, which bloom
  // spreads into large, flashing black rectangles across its mip levels.
  float rim = pow(clamp(1.0 - abs(dot(n, eye)), 0.0, 1.0), 2.8);
  // Broaden undersampled highlights instead of letting them flash between
  // pixels. Blinn highlights also remain stable at grazing view angles.
  vec3 normalDx = dFdx(n);
  vec3 normalDy = dFdy(n);
  float variance = dot(normalDx, normalDx) + dot(normalDy, normalDy);
  float filtering = 1.0 + min(variance * 256.0, 8.0);
  float specular = pow(clamp(dot(n, safeNormalize(light + eye)), 0.0, 1.0), 64.0 / filtering) / filtering;
  float secondSpec = pow(clamp(dot(n, safeNormalize(secondLight + eye)), 0.0, 1.0), 40.0 / filtering) / filtering;
  float stripePhase = vUv.y * 6.2831853 * 76.0 + sin(vUv.x * 31.0) * 2.0;
  float stripeVisibility = 1.0 - smoothstep(.5, 6.2831853, fwidth(stripePhase));
  float striation = .5 + .5 * sin(stripePhase) * stripeVisibility;
  vec3 metal = mix(vec3(.26, .22, .32), vec3(.66, .62, .66), smoothstep(-.4, .8, n.y));
  vec3 color = metal * (.055 + diffuse * .58);
  color *= .86 + striation * .14;
  color += vec3(1.25, 1.17, 1.4) * specular * .95;
  color += vec3(.51, .35, .8) * secondSpec * .65;
  color += vec3(.43, .32, .6) * rim * .42;
  // Evaluate derivatives before discarding any lanes in a fragment quad.
  // Otherwise partial dissolution can make the highlight filtering undefined.
  if (presence < .01 || hash(floor(vUv * vec2(280.0, 72.0))) > presence) discard;
  // Never let an invalid HDR texel poison the bloom convolution.
  if (any(isnan(color)) || any(isinf(color))) color = vec3(0.0);
  color = clamp(color, vec3(0.0), vec3(16.0));
  gl_FragColor = vec4(color, 1.0);
}
