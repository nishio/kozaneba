import { TWorldCoord } from "../dimension/world_to_screen";
import { CSSProperties } from "react";
import { ItemId } from "./ItemId";
import { isV2 } from "./isV2";

export type TScrapboxItem = {
  type: "scrapbox";
  text: string;
  image: string; // url to the thumbnail image, or ""
  url: string; // url to the page
  position: TWorldCoord;
  id: ItemId;
  scale: number;
  description: string[];
  custom?: { style?: CSSProperties };
};

export function isTScrapboxItem(x: any): x is TScrapboxItem {
  return (
    x.type === "scrapbox" &&
    typeof x.text === "string" &&
    typeof x.image === "string" &&
    typeof x.url === "string" &&
    isV2(x.position) &&
    Array.isArray(x.items) &&
    x.items.every((y: any) => typeof y === "string") &&
    typeof x.id === "string" &&
    typeof x.scale === "number" &&
    Array.isArray(x.description) &&
    x.description.every((y: any) => typeof y === "string")
  );
}
