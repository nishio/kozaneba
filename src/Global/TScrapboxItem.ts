import { TWorldCoord } from "../dimension/world_to_screen";
import { CSSProperties } from "react";
import { ItemId } from "./ItemId";

export type TScrapboxItem = {
  type: "scrapbox";
  text: string;
  image: string;
  url: string;
  position: TWorldCoord;
  id: ItemId;
  scale: number;
  description: string[];
  custom?: { style?: CSSProperties };
};
