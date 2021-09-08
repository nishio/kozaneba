import { CSSProperties } from "react";
import { TWorldCoord } from "../dimension/world_to_screen";
import { ItemId } from "./initializeGlobalState";

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
