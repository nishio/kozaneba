import { CSSProperties } from "react";
import {
  Dictionary,
  Literal,
  Number,
  Optional,
  Partial,
  Record,
  Static,
  String,
  Tuple,
  Union,
} from "runtypes";
import { create } from "runtypes/lib/runtype";
import { TWorldCoord } from "../dimension/world_to_screen";
import { isV2 } from "./isV2";
import { TItemId } from "./TItemId";

export type TKozaneItem = {
  type: "kozane";
  text: string;
  position: TWorldCoord;
  id: TItemId;
  scale: number;
  custom?: {
    style?: CSSProperties;
    url?: string;
  };
};

// const RTKozaneItem = Record({
//   type: Literal("kozane"),
//   text: String,
//   position: Tuple(Number, Number),
//   id: String,
//   scale: Number,
//   custom: Optional(
//     Record({
//       style: Dictionary(Union(String, Number), String).optional(),
//       url: String.optional(),
//     })
//   ),
// });

// export type TKozaneItem = Static<typeof RTKozaneItem>;

export function isTKozaneItem(x: any): x is TKozaneItem {
  return (
    x.type === "kozane" &&
    typeof x.text === "string" &&
    isV2(x.position) &&
    typeof x.id === "string" &&
    typeof x.scale === "number"
  );
}
