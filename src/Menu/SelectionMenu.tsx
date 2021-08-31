import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { UserMenuItem } from "../API/UserMenuItem";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { reset_selection } from "../Selection/reset_selection";
import { copy_text } from "./copy_text";
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
    mark_local_changed();
    setMenu("");
  };

  const onDelete = () => {
    getGlobal().selected_items.forEach((id) => {
      delete_item_from_world(id);
    });
    reset_selection();
    mark_local_changed();
    setMenu("");
  };

  const onCopyText = () => {
    copy_text();
    setMenu("");
  };
  return (
    <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
      <MenuItem onClick={onMakeGroup} data-testid="make-group">
        make group
      </MenuItem>
      <MenuItem onClick={onCopyText} data-testid="copy-text">
        copy text
      </MenuItem>

      {kozaneba.user_menus["Selection"]!.map(UserMenuItem)}

      <MenuItem onClick={onDelete}>delete items</MenuItem>
    </Menu>
  );
};
