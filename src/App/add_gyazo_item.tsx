import { add_item } from "../API/add_item";
import { get_center_of_screen } from "../dimension/get_center_of_screen";
import { TGyazoItem } from "../Global/initializeGlobalState";
import { create_new_itemid } from "../utils/create_new_itemid";

export const add_gyazo_item = (url: string) => {
  const gyazo: TGyazoItem = {
    id: create_new_itemid(),
    type: "gyazo",
    text: `[${url}]`,
    url: url,

    position: get_center_of_screen(),
    scale: 1,
  };
  add_item(gyazo);
};
