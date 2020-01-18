// courtesy to PavelDoGreat/WebGL-Fluid-Simulation.

function setupHandlers(canvas, pixelRatio) {
  function scaleByPixelRatio(input) {
    return Math.floor(input * pixelRatio);
  }

  function pointerPrototype() {
    this.id = -1;
    this.texcoordX = 0;
    this.texcoordY = 0;
    this.prevTexcoordX = 0;
    this.prevTexcoordY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.down = false;
    this.moved = false;
    this.color = [30, 0, 300];
    this.force = 1.0;
  }
  let pointers = [];
  pointers.push(new pointerPrototype());

  let mx = 0;
  let my = 0;

  function updatePointerDownData(pointer, id, posX, posY, force = 1.0) {
    pointer.id = id;
    pointer.down = true;
    pointer.moved = false;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    pointer.force = force;
    //   pointer.color = generateColor();
  }

  function updatePointerUpData(pointer) {
    pointer.down = false;
  }

  function updatePointerMoveData(pointer, posX, posY, force = 1.0) {
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved =
      Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    pointer.force = force;
  }

  function correctDeltaX(delta) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio < 1) delta *= aspectRatio;
    return delta;
  }

  function correctDeltaY(delta) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) delta /= aspectRatio;
    return delta;
  }
  canvas.addEventListener("mousedown", e => {
    let posX = scaleByPixelRatio(e.offsetX);
    let posY = scaleByPixelRatio(e.offsetY);
    let pointer = pointers.find(p => p.id == -1);
    if (pointer == null) pointer = new pointerPrototype();
    updatePointerDownData(pointer, -1, posX, posY);
  });

  canvas.addEventListener("mousemove", e => {
    let pointer = pointers[0];
    if (!pointer.down) return;
    let posX = scaleByPixelRatio(e.offsetX);
    let posY = scaleByPixelRatio(e.offsetY);
    updatePointerMoveData(pointer, posX, posY);
  });

  window.addEventListener("mouseup", () => {
    updatePointerUpData(pointers[0]);
  });

  canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    const touches = e.targetTouches;
    while (touches.length >= pointers.length)
      pointers.push(new pointerPrototype());
    for (let i = 0; i < touches.length; i++) {
      let posX = scaleByPixelRatio(touches[i].pageX);
      let posY = scaleByPixelRatio(touches[i].pageY);
      // console.log(touches[i].force);
      updatePointerDownData(
        pointers[i + 1],
        touches[i].identifier,
        posX,
        posY,
        touches[i].force
      );
    }
  });

  canvas.addEventListener(
    "touchmove",
    e => {
      e.preventDefault();
      const touches = e.targetTouches;
      for (let i = 0; i < touches.length; i++) {
        let pointer = pointers[i + 1];
        if (!pointer.down) continue;
        let posX = scaleByPixelRatio(touches[i].pageX);
        let posY = scaleByPixelRatio(touches[i].pageY);
        // console.log(touches[i].force);

        updatePointerMoveData(pointer, posX, posY, touches[i].force);
      }
    },
    false
  );

  window.addEventListener("touchend", e => {
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      let pointer = pointers.find(p => p.id == touches[i].identifier);
      if (pointer == null) continue;
      updatePointerUpData(pointer);
    }
  });

  window.addEventListener("keydown", e => {
    // if (e.code === "KeyP") config.PAUSED = !config.PAUSED;
    // if (e.key === " ") splatStack.push(parseInt(Math.random() * 20) + 5);
  });

  return () => {
    console.log(pointers);
    return pointers;
  };
}

module.exports = setupHandlers;
