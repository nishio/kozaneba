import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { reset_selection } from "../Selection/reset_selection";
import { remove_item } from "../utils/remove_item";
import { delete_item_from_world } from "./delete_item_from_world";

export const make_items_into_new_group = (items: ItemId[]): ItemId => {
  const g = getGlobal();
  const group = new GroupItem();
  group.items = [...items];
  let new_drawOrder = g.drawOrder;
  items.forEach((id) => {
    new_drawOrder = remove_item(new_drawOrder, id);
  });
  updateGlobal((g) => {
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
