import {
  Array,
  Boolean,
  Literal,
  Number,
  Record,
  Static,
  String,
} from "runtypes";
import { RTWorldCoord } from "../dimension/world_to_screen";
import { RTItemId } from "./TItemId";
import { RT_CSSProperties } from "./RT_CSSProperties";

export const RTGroupItem = Record({
  type: Literal("group"),
  text: String,
  position: RTWorldCoord,
  items: Array(RTItemId),
  id: RTItemId,
  scale: Number,
  isOpen: Boolean,
  custom: Record({
    style: RT_CSSProperties.optional(),
  }).optional(),
});
export type TGroupItem = Static<typeof RTGroupItem>;
