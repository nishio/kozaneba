import { ItemId } from "./initializeGlobalState";
import { TWorldCoord } from "../dimension/world_to_screen";
import { CSSProperties } from "react";

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
