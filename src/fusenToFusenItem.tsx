import { FusenItem, ItemId } from "./initializeGlobalState";
import { VFusen } from "./VFusen";

export const fusenToFusenItem = (x: VFusen): FusenItem => {
  return {
    id: "0" as ItemId,
    type: "piece",
    text: x.text,
    position: [x.x, x.y],
    scale: 1,
  };
};
