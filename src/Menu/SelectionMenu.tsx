import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { add_v2, mul_v2, sub_v2 } from "../dimension/V2";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { reset_selection } from "../Selection/reset_selection";
import { remove_item_from } from "../utils/remove_item";
import { delete_item_from_world } from "./delete_item_from_world";

export const make_items_into_new_group = (items: ItemId[]): ItemId => {
  const g = getGlobal();
  const group = new GroupItem();
  group.items = [...items];
  let new_drawOrder = g.drawOrder;
  const N = items.length;
  let v = [0, 0];
  items.forEach((id) => {
    v = add_v2(v, g.itemStore[id].position);
  });
  const gravity_point = mul_v2(1 / N, v);

  items.forEach((id) => {
    new_drawOrder = remove_item_from(new_drawOrder, id);
  });
  updateGlobal((g) => {
    items.forEach((id) => {
      g.itemStore[id].position = sub_v2(
        g.itemStore[id].position,
        gravity_point
      );
    });

    group.position = gravity_point;
    g.drawOrder = new_drawOrder;
    g.itemStore[group.id] = group;
    g.drawOrder.push(group.id);
  });
  return group.id;
};

export const SelectionMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Selection";
  const onClose = () => {
    setMenu("");
  };
  const onMakeGroup = () => {
    const g = getGlobal();
    make_items_into_new_group(g.selected_items);

    reset_selection();
    setMenu("");
  };

  const onDelete = () => {
    getGlobal().selected_items.forEach((id) => {
      delete_item_from_world(id);
    });
    reset_selection();
    setMenu("");
  };

  return (
    <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
      <MenuItem onClick={onMakeGroup} data-testid="make-group">
        make group
      </MenuItem>
      <MenuItem onClick={onDelete}>delete items</MenuItem>
    </Menu>
  );
};
