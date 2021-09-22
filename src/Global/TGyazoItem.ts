import { Literal, Number, Record, Static, String } from "runtypes";
import { RTWorldCoord } from "../dimension/world_to_screen";
import { RTItemId } from "./TItemId";
import { RT_CSSProperties } from "./RT_CSSProperties";

export const RTGyazoItem = Record({
  type: Literal("gyazo"),
  text: String,
  position: RTWorldCoord,
  id: RTItemId,
  scale: Number,
  url: String,
  custom: Record({ style: RT_CSSProperties.optional() }).optional(),
});

export type TGyazoItem = Static<typeof RTGyazoItem>;
