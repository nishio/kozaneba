import { TItemId } from "../Global/TItemId";
import { pin } from "../Physics/pin";

export const unpin = (ids: TItemId[]) => {
  ids.forEach((id) => {
    delete pin[id];
  });
};
