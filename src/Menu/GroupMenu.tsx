import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { add_v2 } from "../dimension/V2";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { remove_item } from "../utils/remove_item";

export const GroupMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Group";
  const onClose = () => {
    setMenu("");
  };
  const onUngroup = () => {
    const g = getGlobal();
    const gid = g.clicked_group;
    if (gid === "") return;

    const group = g.itemStore[gid] as GroupItem;

    updateGlobal((g) => {
      group.items.forEach((id) => {
        g.drawOrder.push(id);
        g.itemStore[id].position = add_v2(
          g.itemStore[id].position,
          group.position
        );
      });
      g.drawOrder = remove_item(g.drawOrder, gid);
      delete g.itemStore[gid];
    });
    setMenu("");
  };

  const onDelete = () => {
    const g = getGlobal();
    const gid = g.clicked_group;
    if (gid === "") return;
    updateGlobal((g) => {
      delete g.itemStore[gid];
      g.drawOrder = remove_item(g.drawOrder, gid);
    });
    setMenu("");
  };

  return (
    <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
      <MenuItem onClick={onUngroup}>ungroup</MenuItem>
      <MenuItem onClick={onDelete}>delete</MenuItem>
    </Menu>
  );
};
