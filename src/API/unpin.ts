import { ItemId } from "../Global/ItemId";
import { pin } from "../Physics/pin";

export const unpin = (ids: ItemId[]) => {
  ids.forEach((id) => {
    delete pin[id];
  });
};
