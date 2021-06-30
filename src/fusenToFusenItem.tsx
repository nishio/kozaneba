import { FusenItem } from "./initializeGlobalState";
import { VFusen } from "./VFusen";

export const fusenToFusenItem = (x: VFusen): FusenItem => {
  return {
    type: "piece",
    text: x.text,
    position: [x.x, x.y],
  };
};
