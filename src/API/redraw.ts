import { getGlobal, setGlobal } from "reactn";

export const redraw = () => {
  const g = getGlobal();
  setGlobal({ drawOrder: [...g.drawOrder] });
};
