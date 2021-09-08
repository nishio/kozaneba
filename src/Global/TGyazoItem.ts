import { TWorldCoord } from "../dimension/world_to_screen";
import { CSSProperties } from "react";
import { ItemId } from "./ItemId";

export type TGyazoItem = {
  type: "gyazo";
  text: string;
  position: TWorldCoord;
  id: ItemId;
  scale: number;
  url: string;
  custom?: { style?: CSSProperties };
};
