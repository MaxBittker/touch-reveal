const { setupOverlay } = require("regl-shader-error-overlay");
setupOverlay();

let pixelRatio = Math.min(window.devicePixelRatio, 1.5);
const regl = require("regl")({
  pixelRatio
  // extensions: ["OES_texture_float"],
  // optionalExtensions: ["oes_texture_float_linear"]
});

let shaders = require("./src/pack.shader.js");
let postShaders = require("./src/post.shader.js");
let setupHandlers = require("./src/touch.js");

let vert = shaders.vertex;
let frag = shaders.fragment;

let getPointers = setupHandlers(regl._gl.canvas, pixelRatio);
pointers = getPointers();
shaders.on("change", () => {
  console.log("update");
  vert = shaders.vertex;
  frag = shaders.fragment;
  let overlay = document.getElementById("regl-overlay-error");
  overlay && overlay.parentNode.removeChild(overlay);
});

const fbo = regl.framebuffer({
  color: regl.texture({
    width: 1,
    height: 1,
    wrap: "clamp"
  }),
  depth: true
});

// const fbo = regl.framebuffer({ colorType: "float", colorFormat: "rgba" });

const drawFboBlurred = regl({
  frag: () => postShaders.fragment,
  vert: () => postShaders.vertex,

  attributes: {
    position: [-4, -4, 4, -4, 0, 4]
  },
  uniforms: {
    t: ({ tick }) => tick,
    tex: ({ count }) => fbo,
    resolution: ({ viewportWidth, viewportHeight }) => [
      viewportWidth,
      viewportHeight
    ],
    wRcp: ({ viewportWidth }) => 1.0 / viewportWidth,
    hRcp: ({ viewportHeight }) => 1.0 / viewportHeight,
    pixelRatio
  },
  depth: { enable: false },
  count: 3,
  blend: {
    enable: true,
    func: {
      srcRGB: "src alpha",
      srcAlpha: 1,
      dstRGB: "one minus src alpha",
      dstAlpha: 1
    },
    equation: {
      rgb: "add",
      alpha: "add"
    },
    color: [0, 0, 0, 0]
  }
});

const lastFrame = regl.texture();

// let lastPointer(){

// }
let drawTriangle = regl({
  framebuffer: fbo,

  uniforms: {
    // Becomes `uniform float t`  and `uniform vec2 resolution` in the shader.
    t: ({ tick }) => tick,
    force: regl.prop("force"),
    point: (context, props) => [
      props.pointer.texcoordX,
      props.pointer.texcoordY
    ],
    resolution: ({ viewportWidth, viewportHeight }) => [
      viewportWidth,
      viewportHeight
    ],
    backBuffer: lastFrame
  },

  frag: () => shaders.fragment,
  vert: () => shaders.vertex,
  attributes: {
    // Full screen triangle
    position: [
      [-1, 4],
      [-1, -1],
      [4, -1]
    ]
  },
  // Our triangle has 3 vertices
  count: 3
});

regl.frame(function({ viewportWidth, viewportHeight, tick }) {
  fbo.resize(viewportWidth, viewportHeight);
  // console.log(tick);

  fbo.use(() => {
    regl.clear({
      color: [0, 0, 0, 1],
      depth: 1
    });
    // console.log(pointers);
    pointers.forEach(pointer => {
      if (pointer.down) {
        pointer.moved = false;
        // console.log(pointer.id);
        // let pointer = pointers[pointers.length - 1];
        drawTriangle({ pointer, force: pointer.force || 0.5 });
        // console.log(pointer.force);
        lastFrame({
          copy: true
        });
      }
    });
    drawTriangle({ pointer: { texcoordX: -9, texcoordY: -9 }, force: 0.0 });
    lastFrame({
      copy: true
    });
  });
  // regl.clear({
  //   color: [0, 0, 0, 1]
  // });
  drawFboBlurred();
  // drawTriangle();
});
