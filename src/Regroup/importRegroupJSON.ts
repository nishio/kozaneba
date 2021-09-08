import { State } from "reactn/default";
import { TOffset } from "../dimension/TOffset";
import { get_item } from "../utils/get_item";

type TPiece = {
  type: "piece";
  position: number[];
};
type TGroup = {
  type: "group";
  position: number[];
  items: string[];
};
type TItem = TPiece | TGroup;

type RegroupJSON = {
  drawOrder: string[];
  itemStore: { [key: string]: TItem };
};

export const importRegroupJSON = (json: RegroupJSON) => {
  json.drawOrder.forEach((id) => {
    const item = get_item(json as State, id);
    if (item.type === "group") {
      item.items.forEach((child: string) => {
        updatePosition(json, child, {
          x: item.position[0],
          y: item.position[1],
        });
      });
    }
  });
  return json;
};

const updatePosition = (json: RegroupJSON, id: string, offset: TOffset) => {
  const item = json.itemStore[id]!;
  if (item.type === "group") {
    item.items.forEach((child: string) => {
      updatePosition(json, child, {
        x: item.position[0]!,
        y: item.position[1]!,
      });
    });
  }

  item.position[0] -= offset.x;
  item.position[1] -= offset.y;
};
