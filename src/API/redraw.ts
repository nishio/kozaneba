import { getGlobal, setGlobal } from "../Global/ReactnCompat";

export const redraw = () => {
  const g = getGlobal();
  setGlobal({ drawOrder: [...g.drawOrder] });
};
