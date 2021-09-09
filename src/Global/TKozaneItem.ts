import { CSSProperties } from "react";
import { TWorldCoord } from "../dimension/world_to_screen";
import { isV2 } from "./isV2";
import { ItemId } from "./ItemId";

export type TKozaneItem = {
  type: "kozane";
  text: string;
  position: TWorldCoord;
  id: ItemId;
  scale: number;
  custom?: {
    style?: CSSProperties;
    url?: string;
  };
};

export function isTKozaneItem(x: any): x is TKozaneItem {
  return (
    x.type === "kozane" &&
    typeof x.text === "string" &&
    isV2(x.position) &&
    typeof x.id === "string" &&
    typeof x.scale === "number"
  );
}
