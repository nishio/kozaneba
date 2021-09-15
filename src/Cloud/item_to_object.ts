import { TItem } from "../Global/TItem";

export const item_to_object = (x: TItem) => {
  return Object.assign({}, x);
};
