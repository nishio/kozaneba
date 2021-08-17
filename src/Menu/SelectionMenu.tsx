import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { reset_selection } from "../Selection/reset_selection";
import { delete_item_from_world } from "./delete_item_from_world";
import { make_items_into_new_group } from "./make_items_into_new_group";

export const SelectionMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Selection";
  const onClose = () => {
    setMenu("");
  };
  const onMakeGroup = () => {
    const g = getGlobal();
    make_items_into_new_group(g.selected_items, {});

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
