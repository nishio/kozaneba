import { Array, Literal, Number, Record, Static, String } from "runtypes";
import { RTWorldCoord } from "../dimension/world_to_screen";
import { RTItemId } from "./TItemId";
import { RT_CSSProperties } from "./TKozaneItem";

export const RTScrapboxItem = Record({
  type: Literal("scrapbox"),
  text: String,
  image: String,
  url: String,

  position: RTWorldCoord,
  id: RTItemId,
  scale: Number,
  description: Array(String),
  custom: Record({
    style: RT_CSSProperties.optional(),
  }).optional(),
});

export type TScrapboxItem = Static<typeof RTScrapboxItem>;
