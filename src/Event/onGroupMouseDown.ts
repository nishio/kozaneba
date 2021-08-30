import React from "react";
import { V2 } from "../dimension/V2";
import { ItemId } from "../Global/initializeGlobalState";
import { onGenericMouseDown } from "./onGenericMouseDown";

// almost same with onKozaneMouseDown
export const onGroupMouseDown = (
  event: React.MouseEvent<HTMLDivElement>,
  value: { id: ItemId; position: V2 }
) => {
  onGenericMouseDown(event, value);
};
