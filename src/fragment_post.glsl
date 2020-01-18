
precision mediump float;
varying vec2 uv;
uniform sampler2D tex;
uniform float wRcp, hRcp;
uniform vec2 resolution;

#define R int(0)

// clang-format off
// #pragma glslify: dither = require(glsl-dither)
#pragma glslify: dither = require(glsl-dither/8x8)
// #pragma glslify: dither = require(glsl-dither/4x4)
// #pragma glslify: dither = require(glsl-dither/2x2)
// clang-format on

void main() {
  vec4 color = texture2D(tex, uv);

  // gl_FragColor = vec4(1.0, 0., 1.0, 1.0);
  gl_FragColor = dither(gl_FragCoord.xy, color);
  // gl_FragColor = color;
}
