import { setGlobal } from "reactn";

export const onWheel = (e: WheelEvent) => {
  e.preventDefault();
  if (e.ctrlKey) {
    setGlobal((g) => {
      return {
        scale: g.scale * Math.exp(-e.deltaY / 100),
      };
    });
  } else {
    setGlobal((g) => {
      return {
        trans_x: g.trans_x - e.deltaX,
        trans_y: g.trans_y - e.deltaY,
      };
    });
  }
};
