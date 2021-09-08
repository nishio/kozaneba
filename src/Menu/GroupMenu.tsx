import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { UserMenuItem } from "../API/UserMenuItem";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { get_group } from "../utils/get_group";
import { updateGlobal } from "../Global/updateGlobal";
import { BigMenuItem, SmallMenuItem } from "./BigSmallMenuItem";
import { close_context_menu } from "../utils/close_context_menu";
import { delete_item_from_world } from "../utils/delete_item_from_world";
import { move_front } from "../utils/move_front";
import { normalize_group_position } from "../utils/normalize_group_position";
import { ungroup } from "./ungroup";

export const GroupMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Group";
  if (!open) return null;

  const g = getGlobal();
  const id = g.clicked_target;
  if (id === "" || g.itemStore[id] === undefined) return null;
  const group = get_group(g, id);

  const onUngroup = () => {
    ungroup(id);
  };

  const onDelete = () => {
    delete_item_from_world(id);
    updateGlobal((g) => {
      g.clicked_target = "";
    });
    mark_local_changed();
    setMenu("");
  };

  const isOpenGroup = group !== null && group.isOpen;
  const labelOpenClose = isOpenGroup ? "close" : "open";
  const onOpenClose = () => {
    normalize_group_position(id);
    move_front(id);
    updateGlobal((g) => {
      const group = get_group(g, id);
      group.isOpen = !isOpenGroup;
      g.menu = "";
    });
  };

  const onEditGroupTitle = () => {
    updateGlobal((g) => {
      g.dialog = "EditGroupTitle";
    });
  };

  return (
    <Menu
      anchorEl={anchor}
      keepMounted
      open={open}
      onClose={close_context_menu}
      data-testid="group-menu"
    >
      <MenuItem onClick={onOpenClose} data-testid="group-open-close">
        {labelOpenClose}
      </MenuItem>
      {!isOpenGroup ? <BigMenuItem id={id} /> : null}
      {!isOpenGroup ? <SmallMenuItem id={id} /> : null}
      <MenuItem onClick={onUngroup} data-testid="group-ungroup">
        ungroup
      </MenuItem>
      <MenuItem onClick={onEditGroupTitle}>edit group title</MenuItem>

      {kozaneba.user_menus["Group"]!.map(UserMenuItem)}
      <MenuItem onClick={onDelete} data-testid="group-delete">
        delete
      </MenuItem>
    </Menu>
  );
};
