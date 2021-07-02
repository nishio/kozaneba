import { idToDom } from "./idToDom";
import { ItemId } from "./initializeGlobalState";
import { TOffset } from "./TOffset";

export const idsToDom = (ids: ItemId[], offset: TOffset) => {
  return ids.map((id) => idToDom(id, offset));
};
