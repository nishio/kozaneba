import { V2 } from "../dimension/V2";
import { TItemId } from "../Global/TItemId";
import { onGenericMouseDown } from "./onGenericMouseDown";
import { TInputEvent } from "./input_event";

// almost same with onGroupMouseDown
export const onKozaneMouseDown = (
  event: TInputEvent<HTMLDivElement>,
  value: { id: TItemId; position: V2 }
) => {
  onGenericMouseDown(event, value);
};
