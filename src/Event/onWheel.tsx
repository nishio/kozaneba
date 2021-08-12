import { updateGlobal } from "../Global/updateGlobal";

export const onWheel = (e: WheelEvent) => {
  e.preventDefault();
  if (e.ctrlKey) {
    updateGlobal((g) => {
      g.scale *= Math.exp(-e.deltaY / 100);
    });
  } else if (e.shiftKey) {
    updateGlobal((g) => {
      g.trans_x -= e.deltaY / g.scale;
      g.trans_y -= e.deltaX / g.scale;
    });
  } else {
    updateGlobal((g) => {
      g.trans_x -= e.deltaX / g.scale;
      g.trans_y -= e.deltaY / g.scale;
    });
  }
};
