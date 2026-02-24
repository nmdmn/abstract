struct general_params {
  float elapsedTime;
  float deltaTime;
  vec2 mouse;
  vec2 resolution;
};
uniform general_params general;
varying vec2 vUv;

//
// Ascend by bµg
// License: CC BY-NC-SA 4.0
//
// Portage of: https://art.pkh.me/2026-02-22-ascend.htm (469 chars)
//

#define V(c) d = min(d, 0.), k += a = d*k-d, o += a * exp(-s*1.3) * (c+c*d)
#define N(x,y) abs(dot(sin(p/a*x), p-p+a*y))

void mainImage(out vec4 O, vec2 P) {
  // shadertoy uniform maps ////////////////////////////////////////////////////
  float iTime = general.elapsedTime;
  float iTimeDelta = general.deltaTime;
  vec4 iMouse = vec4(general.mouse, 1., 1.);
  vec3 iResolution = vec3(general.resolution, 1.);
  //////////////////////////////////////////////////////////////////////////////
  // ±!@#$%^&*()_+ /////////////////////////////////////////////////////////////
  vec3 o,p,q,
       R = iResolution;

  for (
      float i,d,a,l,k,s,x,
      T = iTime
      ; i++ < 1e2
      ; V(mix(vec3(0,1.5,3), q=vec3(3,1,.7), x=max(2.-l,0.)*.8)),
      d = l,
      V(q*20.),
      o += (x-x*k)/s/4e2
      )
    for (
        p = normalize(vec3(P+P-R.xy,R.y))*i*.05,
        p.z -= 3.,
        s = length(q=p-vec3(1.5,.7,0)),
        q.y = p.y-min(p.y,.7),
        l = length(q),
        p.y += T,
        d = min(length(p.xz), 1.-p.z),
        a = .01
        ; a < 3.
        ; a += a)
      p.zy *= .1*mat2(8,6,-6,8),
        d -= N(4.,.2),
        l -= N(5.,.01);

  O.rgb = tanh(o);
}

void main() {
  //mimic shadertoy fragCoord input vector
  vec2 fragCoord = vUv * general.resolution.xy;
  vec4 fragColor;
  mainImage(fragColor, fragCoord);
  gl_FragColor = vec4(fragColor.rgb, 1.);
}
