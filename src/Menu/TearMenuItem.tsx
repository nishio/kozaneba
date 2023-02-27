import { MenuItem } from "@mui/material";
import React from "react";
import { close_context_menu } from "../utils/close_context_menu";
import { updateGlobal } from "../Global/updateGlobal";
import { getGlobal } from "reactn";
import { get_item } from "../utils/get_item";
import { create_new_itemid } from "../utils/create_new_itemid";
import { add_item } from "../API/add_item";
import { TItemId } from "../Global/TItemId";
import { delete_item_from_world } from "../utils/delete_item_from_world";
import { get_global_position } from "../dimension/get_global_position";
import { get_middle_point } from "../Canvas/Annotation/get_middle_point";
import { sub_v2, normalize, mul_v2, add_v2w } from "../dimension/V2";
import { KOZANE_HEIGHT } from "../utils/kozane_constants";
import { TWorldCoord } from "../dimension/world_to_screen";

type PropsType = { id: TItemId };

export const TearMenuItem = React.forwardRef<HTMLLIElement, PropsType>(
  ({ id }, ref) => {
    const g = getGlobal();
    const target = get_item(g, id);

    let count = 0;
    g.annotations.forEach((a) => {
      if (a.type === "line") {
        if (a.items.includes(id)) {
          count++;
        }
      }
    });
    if (count < 2) {
      // no need to tear
      return null;
    }
    const onTear = () => {
      updateGlobal((g) => {
        g.annotations.forEach((a) => {
          if (a.type === "line") {
            if (a.items.includes(id)) {
              const positions = a.items.map((id) => get_global_position(id, g));
              const center = get_middle_point(positions);

              const i = a.items.indexOf(id);
              const diff = sub_v2(center, positions[i]!);
              const dir = normalize(diff);
              const move = mul_v2(KOZANE_HEIGHT, dir) as TWorldCoord;

              const new_kozane = { ...target };
              new_kozane.id = create_new_itemid();
              new_kozane.position = add_v2w(target.position, move);
              add_item(new_kozane);

              a.items[i] = new_kozane.id;
            }
          }
        });
      });
      delete_item_from_world(id);
      close_context_menu();
    };

    return <MenuItem onClick={onTear}>tear</MenuItem>;
  }
);
