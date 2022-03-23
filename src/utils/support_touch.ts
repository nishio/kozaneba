type Props = {
  onMouseDown?: unknown;
  onMouseMove?: unknown;
  onMouseUp?: unknown;
};
export const touch_support = (handlers: Props): unknown => {
  // derived from Paper.js
  // https://github.com/paperjs/paper.js/blob/3ef3ca66d5a615df53f001331081396ae701c276/src/view/View.js#L1071
  const navigator = window.navigator;
  let mousedown, mousemove, mouseup;
  // if (navigator.pointerEnabled || navigator.msPointerEnabled) {
  //   mousedown = "onPointerDown";
  //   mousemove = "onPointerMove";
  //   mouseup = "onPointerUp onPointerCancel";
  // } else{
  mousedown = "onTouchStart";
  mousemove = "onTouchMove";
  mouseup = "onTouchEnd onTouchCancel";
  // Do not add mouse events on mobile and tablet devices
  if (
    !(
      "ontouchstart" in window &&
      navigator.userAgent.match(/mobile|tablet|ip(ad|hone|od)|android|silk/i)
    )
  ) {
    // For non pointer events browsers and mixed browsers, like chrome
    // on Windows8 touch laptop.
    mousedown += " onMouseDown";
    mousemove += " onMouseMove";
    mouseup += " onMouseUp";
  }
  // }

  const result = {} as any;
  if ("onMouseDown" in handlers) {
    mousedown.split(" ").forEach((name) => {
      result[name] = handlers["onMouseDown"];
    });
  }
  if ("onMouseMove" in handlers) {
    mousemove.split(" ").forEach((name) => {
      result[name] = handlers["onMouseMove"];
    });
  }
  if ("onMouseUp" in handlers) {
    mouseup.split(" ").forEach((name) => {
      result[name] = handlers["onMouseUp"];
    });
  }

  return result;
};
