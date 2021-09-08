import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { UserMenuItem } from "../API/UserMenuItem";
import { mark_local_changed } from "../utils/mark_local_changed";
import { pin } from "../Physics/pin";
import { reset_selection } from "../Selection/reset_selection";
import { copy_json } from "./copy_json";
import { copy_text } from "./copy_text";
import { delete_item_from_world } from "../utils/delete_item_from_world";
import { make_items_into_new_group } from "../utils/make_items_into_new_group";

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

  const onUnpin = () => {
    getGlobal().selected_items.forEach((id) => {
      delete pin[id];
    });
    setMenu("");
  };
  const onCopyText = () => {
    copy_text();
    setMenu("");
  };

  const onCopyJSON = () => {
    copy_json();
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
      <MenuItem onClick={onCopyJSON} data-testid="copy-text">
        copy JSON
      </MenuItem>

      {kozaneba.user_menus["Selection"]!.map(UserMenuItem)}

      <MenuItem onClick={onUnpin}>unpin</MenuItem>
      <MenuItem onClick={onDelete}>delete items</MenuItem>
    </Menu>
  );
};
