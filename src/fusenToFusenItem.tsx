import { ItemId } from "./Global/initializeGlobalState";
import { TFusenItem } from "./Fusen/FusenItem";
import { VFusen } from "./VFusen";

export const fusenToFusenItem = (x: VFusen): TFusenItem => {
  return {
    id: "0" as ItemId,
    type: "piece",
    text: x.text,
    position: [x.x, x.y],
    scale: 1,
  };
};
