import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { UserMenuItem } from "../API/UserMenuItem";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { add_v2w, clone_v2w } from "../dimension/V2";
import { get_group } from "../Event/get_group";
import { get_item } from "../Event/get_item";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { KozaneItem } from "../Kozane/KozaneItem";
import { remove_item_from } from "../utils/remove_item";
import { BigMenuItem, SmallMenuItem } from "./BigSmallMenuItem";
import { close_context_menu } from "./close_context_menu";
import { delete_item_from_world } from "./delete_item_from_world";
import { move_front } from "./move_front";
import { normalize_group_position } from "./normalize_group_position";

export const GroupMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Group";

  const g = getGlobal();
  const gid = g.clicked_target;
  if (gid === "") return null;
  const group = g.itemStore[gid] as GroupItem;

  const onUngroup = () => {
    updateGlobal((g) => {
      group.items.forEach((id) => {
        g.drawOrder.push(id);
        const item = get_item(g, id);
        item.position = add_v2w(item.position, group.position);
      });
      if (group.text !== "") {
        // add kozane of group title
        const kozane = new KozaneItem();
        kozane.text = group.text;
        kozane.position = clone_v2w(group.position);
        g.itemStore[kozane.id] = kozane;
        g.drawOrder.push(kozane.id);
      }
      g.drawOrder = remove_item_from(g.drawOrder, gid);
      delete g.itemStore[gid];
      g.clicked_target = "";
    });
    setMenu("");
  };

  const onDelete = () => {
    delete_item_from_world(gid);
    updateGlobal((g) => {
      g.clicked_target = "";
    });
    mark_local_changed();
    setMenu("");
  };

  // after deletion of group it causes error?

  const isOpenGroup = group !== null && group.isOpen;
  const labelOpenClose = isOpenGroup ? "close" : "open";
  const onOpenClose = () => {
    normalize_group_position(gid);
    move_front(gid);
    updateGlobal((g) => {
      const group = get_group(g, gid);
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
      {!isOpenGroup ? <BigMenuItem id={gid} /> : null}
      {!isOpenGroup ? <SmallMenuItem id={gid} /> : null}
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
