uniform float uTime;
uniform float uProgress;
uniform float uVelocity;

const float TAU = 6.28318530718;

// A common parametric surface keeps the mesh and its particles together.
vec3 matterSurface(vec2 coordinate, float detail) {
  float a = coordinate.x * TAU;
  float b = coordinate.y * TAU;
  float breath = sin(uTime * .35) * .025;
  float fold = b + a * 2.0 + .22 * sin(a * 3.0 + uTime * .12);
  float radius = 2.45 + .19 * sin(a * 3.0);
  float tube = .77 + .13 * sin(a * 3.0 + 1.3) + breath;
  // Keep geometric ridges below the mesh's sampling limit; fine grain is shaded.
  float fluting = .018 * sin(b * 16.0 + a * 5.0) * detail;
  vec3 origin = vec3(
    (radius + (tube + fluting) * cos(fold)) * cos(a),
    (radius + (tube + fluting) * cos(fold)) * sin(a),
    (tube + fluting) * sin(fold) + .24 * sin(a * 3.0)
  );

  float pulse = sin(a * 5.0 - uTime * .6) * .07;
  vec3 resonance = vec3(
    (3.1 + (.42 + pulse) * cos(fold)) * cos(a),
    (3.1 + (.42 + pulse) * cos(fold)) * sin(a),
    .6 * sin(fold) + .75 * sin(a * 3.0 + uTime * .18)
  );

  vec3 dissolution = vec3(
    4.5 * cos(a) + .75 * sin(b * 2.0 + a),
    2.05 * sin(a * 2.0) + .65 * cos(b + a),
    1.4 * sin(a * 3.0 + b)
  );

  float haloRadius = 2.85 + .025 * sin(a * 6.0 + uTime * .15);
  vec3 stillness = vec3(
    (haloRadius + .025 * cos(b)) * cos(a),
    (haloRadius + .025 * cos(b)) * sin(a),
    .025 * sin(b) + .06 * sin(a * 3.0)
  );

  vec3 p = mix(origin, resonance, smoothstep(0.0, 1.0, uProgress));
  p = mix(p, dissolution, smoothstep(1.0, 2.0, uProgress));
  p = mix(p, stillness, smoothstep(2.0, 3.0, uProgress));
  return p;
}

vec3 matter(vec2 coordinate) {
  return matterSurface(coordinate, 1.0);
}

vec3 matterNormal(vec2 coordinate) {
  const float stepSize = .0005;
  // Fine ridges shouldn't steer the mirror-like highlights: that produces
  // temporal sparkle even when the silhouette itself is antialiased.
  vec3 tangent = matterSurface(coordinate + vec2(stepSize, 0.0), 0.0) - matterSurface(coordinate - vec2(stepSize, 0.0), 0.0);
  vec3 bitangent = matterSurface(coordinate + vec2(0.0, stepSize), 0.0) - matterSurface(coordinate - vec2(0.0, stepSize), 0.0);
  vec3 normal = cross(tangent, bitangent);
  float magnitudeSquared = dot(normal, normal);
  return magnitudeSquared > 1e-20 ? normal * inversesqrt(magnitudeSquared) : vec3(0.0, 0.0, 1.0);
}
