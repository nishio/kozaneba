import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { add_v2w, clone_v2w } from "../dimension/V2";
import { get_item } from "../Event/get_item";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { KozaneItem } from "../Kozane/KozaneItem";
import { remove_item_from } from "../utils/remove_item";
import { delete_item_from_world } from "./delete_item_from_world";
import { BigSmallMenuItem } from "./BigSmallMenuItem";

export const GroupMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Group";
  const onClose = () => {
    setMenu("");
  };

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
    setMenu("");
  };

  // after deletion of group it causes error?

  const isOpenGroup = group !== null && group.isOpen;
  const labelOpenClose = isOpenGroup ? "close" : "open";
  const onOpenClose = () => {
    updateGlobal((g) => {
      (g.itemStore[gid] as GroupItem).isOpen = !isOpenGroup;
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
      onClose={onClose}
      data-testid="group-menu"
    >
      <MenuItem onClick={onOpenClose} data-testid="group-open-close">
        {labelOpenClose}
      </MenuItem>
      {!isOpenGroup ? <BigSmallMenuItem id={gid} /> : null}
      <MenuItem onClick={onUngroup} data-testid="group-ungroup">
        ungroup
      </MenuItem>
      <MenuItem onClick={onEditGroupTitle}>edit group title</MenuItem>
      <MenuItem onClick={onDelete} data-testid="group-delete">
        delete
      </MenuItem>
    </Menu>
  );
};
