precision highp float;
uniform float t;
uniform vec2 resolution;
uniform sampler2D backBuffer;
uniform vec2 point;
// uniform float aspectRatio;
uniform float force;
// uniform float radius;

// uniform sampler2D webcam;
// uniform vec2 videoResolution;
// uniform vec2 eyes[2];

varying vec2 uv;

// clang-format off
#pragma glslify: squareFrame = require("glsl-square-frame")
#pragma glslify: worley2D = require(glsl-worley/worley2D.glsl)
#pragma glslify: hsv2rgb = require('glsl-hsv2rgb')
#pragma glslify: luma = require(glsl-luma)
#pragma glslify: smin = require(glsl-smooth-min)
#pragma glslify: fbm3d = require('glsl-fractal-brownian-noise/3d')
#pragma glslify: noise = require('glsl-noise/simplex/3d')

// clang-format on
#define PI 3.14159265359

void main() {
  float aspectRatio = resolution.x / resolution.y;
  vec2 pixel = vec2(1.0) / resolution;
  vec2 vUv = uv * 0.5 + vec2(0.5);

  float radius = (force + 0.3) / 200.;
  vec2 p = vUv - point.xy;

  p.x *= aspectRatio;

  vec3 splat = exp(-dot(p, p) / radius) * vec3(0.1);
  vec3 base = texture2D(backBuffer, vUv).xyz;

  if (length(base) / 30.0 > length(splat)) {
    // splat *= 0.;
  }
  vec3 drip = texture2D(backBuffer, vUv + vec2(0., pixel.y)).xyz;
  vec3 below = texture2D(backBuffer, vUv - vec2(0., pixel.y)).xyz;

  float n = 0.9 + noise(vec3(vUv * 50., t * 0.05)) * 0.05;
  float dripmap = noise(vec3(vUv.xy * vec2(50.0, 1.0), t * 0.000));
  //  > 0.9;
  // if (length(drip) + length(base) > 1.7) {
  //   if (dripmap < 0.5) {
  //     drip *= 0.0;
  //   } else {
  //     drip *= 0.993;
  //     // if (length(base) > 1.3) {
  //     // base *= 0.995;
  //     // }
  //   }
  //   if (length(drip) > length(below)) {
  //     base *= 0.995;
  //   }
  // } else {
  //   drip *= 0.;
  // }

  // gl_FragColor = vec4(splat * n + max(base * 0.999, drip), 1.0);
  float fn = 0.997 + noise(vec3(vUv * 100., t * 0.9)) * 0.02;

  gl_FragColor = vec4(splat * n + base * fn, 1.0);
  // if (dripmap > 0.6) {
  // gl_FragColor.r = 1.0;
  // }
  //    vec2 p = vUv - point.xy;
  // // vec2 pos = squareFrame(resolution);
  // // vec2 textCoord = uv * 0.5 + vec2(0.5);

  // float a = t * 0.01;
  // vec2 loc = point;
  // float d = 0.2 - length(loc - pos);
  // d = max(d, 0.);
  // d = pow(d, 0.22);
  // vec3 paint = vec3(d);

  // vec3 prev = texture2D(backBuffer, textCoord).rgb * 1.0;

  // vec3 color = max(paint, prev * 0.99);

  // gl_FragColor = vec4(color, 1.0);
}