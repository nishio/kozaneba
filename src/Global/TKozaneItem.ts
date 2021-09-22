import { Literal, Number, Optional, Record, Static, String } from "runtypes";
import { RTWorldCoord } from "../dimension/world_to_screen";
import { RT_CSSProperties } from "./RT_CSSProperties";
import { RTItemId } from "./TItemId";

export const RTKozaneItem = Record({
  type: Literal("kozane"),
  text: String,
  position: RTWorldCoord,
  id: RTItemId,
  scale: Number,
  custom: Optional(
    Record({
      style: RT_CSSProperties.optional(),
      url: String.optional(),
    })
  ),
});

export type TKozaneItem = Static<typeof RTKozaneItem>;
