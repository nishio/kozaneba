import React from "react";
import { V2 } from "../dimension/V2";
import { TItemId } from "../Global/TItemId";
import { onGenericMouseDown } from "./onGenericMouseDown";

// almost same with onGroupMouseDown
export const onKozaneMouseDown = (
  event: React.MouseEvent<HTMLDivElement>,
  value: { id: TItemId; position: V2 }
) => {
  onGenericMouseDown(event, value);
};
