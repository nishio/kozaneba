import { CSSProperties } from "react";
import { TWorldCoord } from "../dimension/world_to_screen";
import { isV2 } from "./isV2";
import { TItemId } from "./TItemId";

export type TGyazoItem = {
  type: "gyazo";
  text: string;
  position: TWorldCoord;
  id: TItemId;
  scale: number;
  url: string;
  custom?: { style?: CSSProperties };
};

export function isTGyazoItem(x: any): x is TGyazoItem {
  return (
    x.type === "gyazo" &&
    typeof x.text === "string" &&
    typeof x.url === "string" &&
    isV2(x.position) &&
    Array.isArray(x.items) &&
    x.items.every((y: any) => typeof y === "string") &&
    typeof x.id === "string" &&
    typeof x.scale === "number"
  );
}
