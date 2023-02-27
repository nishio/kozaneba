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

type PropsType = { id: TItemId };

export const TearMenuItem = React.forwardRef<HTMLLIElement, PropsType>(
  ({ id }, ref) => {
    const g = getGlobal();
    const target = get_item(g, id);
    const onTear = () => {
      updateGlobal((g) => {
        g.annotations.forEach((a) => {
          if (a.type === "line") {
            if (a.items.includes(id)) {
              const i = a.items.indexOf(id);

              const new_kozane = { ...target };
              new_kozane.id = create_new_itemid();
              new_kozane.position = target.position;
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
