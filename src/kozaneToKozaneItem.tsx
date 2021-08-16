import { TWorldCoord } from "./dimension/world_to_screen";
import { ItemId } from "./Global/initializeGlobalState";
import { TKozaneItem } from "./Kozane/KozaneItem";
import { VKozane } from "./VKozane";

export const kozaneToKozaneItem = (x: VKozane): TKozaneItem => {
  return {
    id: "0" as ItemId,
    type: "kozane",
    text: x.text,
    position: [x.x, x.y] as TWorldCoord,
    scale: 1,
  };
};
