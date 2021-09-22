import {
  Dictionary,
  Literal,
  Number,
  Optional,
  Record,
  Static,
  String,
} from "runtypes";
import { RTWorldCoord } from "../dimension/world_to_screen";
import { isV2 } from "./isV2";
import { RTItemId } from "./TItemId";

export const RTKozaneItem = Record({
  type: Literal("kozane"),
  text: String,
  position: RTWorldCoord,
  id: RTItemId,
  scale: Number,
  custom: Optional(
    Record({
      style: Dictionary(String.Or(Number)).optional(),
      url: String.optional(),
    })
  ),
});

export type TKozaneItem = Static<typeof RTKozaneItem>;

export function isTKozaneItem(x: any): x is TKozaneItem {
  return (
    x.type === "kozane" &&
    typeof x.text === "string" &&
    isV2(x.position) &&
    typeof x.id === "string" &&
    typeof x.scale === "number"
  );
}
