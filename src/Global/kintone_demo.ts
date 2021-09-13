import { create_squared_position } from "../dimension/create_squared_position";
import { get_center_of_screen } from "../dimension/get_center_of_screen";
import { GroupItem } from "../Group/GroupItem";
import { KozaneItem } from "../Kozane/KozaneItem";
import { TItem } from "./TItem";
import { TKozaneItem } from "./TKozaneItem";
import { updateGlobal } from "./updateGlobal";

export const kintone_demo = (
  baseUrl: string,
  app: string,
  apiToken: string
) => {
  fetch("http://localhost:5001/regroup-d4932/us-central1/kintone_get", {
    method: "post",
    body: JSON.stringify({ baseUrl, app, apiToken }),
  })
    .then((res) => res.json())
    .then((records) => {
      console.log(records);

      // from create_squared_group
      const positions = create_squared_position(records);
      const group = new GroupItem();
      const kozane_list = [] as TItem[];
      records.forEach((r: any, index: number) => {
        const kozane: TKozaneItem = new KozaneItem();
        kozane.text = r["文字列__1行_"].value;
        kozane.position = positions[index]!;
        const record_id = r["$id"].value;
        kozane.custom = {
          url: `${baseUrl}/k/${app}/show#record=${record_id}`,
        };
        kozane_list.push(kozane);
      });

      updateGlobal((g) => {
        kozane_list.forEach((kozane) => {
          g.itemStore[kozane.id] = kozane;
          group.items.push(kozane.id);
        });
      });

      updateGlobal((g) => {
        group.position = get_center_of_screen();
        g.itemStore[group.id] = group;
        g.drawOrder.push(group.id);
      });
    });
};
