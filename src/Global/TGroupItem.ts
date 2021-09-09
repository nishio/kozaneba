import { CSSProperties } from "react";
import { TWorldCoord } from "../dimension/world_to_screen";
import { isV2 } from "./isV2";
import { ItemId } from "./ItemId";

export type TGroupItem = {
  type: "group";
  text: string;
  position: TWorldCoord;
  items: ItemId[];
  id: ItemId;
  scale: number; // scale of Nameplate Kozane
  isOpen: boolean;
  custom?: { style?: CSSProperties };
};

export function isTGroupItem(x: any): x is TGroupItem {
  return (
    x.type === "group" &&
    typeof x.text === "string" &&
    isV2(x.position) &&
    Array.isArray(x.items) &&
    x.items.every((y: any) => typeof y === "string") &&
    typeof x.id === "string" &&
    typeof x.scale === "number" &&
    typeof x.isOpen === "boolean"
  );
}
