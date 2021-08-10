import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { add_v2 } from "../dimension/V2";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { remove_item } from "../utils/remove_item";
import { delete_item_from_world } from "./delete_item_from_world";

export const GroupMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Group";
  const onClose = () => {
    setMenu("");
  };

  const g = getGlobal();
  const gid = g.clicked_group;
  if (gid === "") return null;
  const group = g.itemStore[gid] as GroupItem;

  const onUngroup = () => {
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
    delete_item_from_world(gid);
    setMenu("");
  };

  // after deletion of group it causes error
  // const isOpenGroup = group.isOpen;
  // const labelOpenClose = isOpenGroup ? "close" : "open";
  // const onOpenClose = () => {
  //   updateGlobal((g) => {
  //     (g.itemStore[gid] as GroupItem).isOpen = !isOpenGroup;
  //   });
  // };

  return (
    <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
      {/* <MenuItem onClick={onOpenClose}>{labelOpenClose}</MenuItem> */}

      <MenuItem onClick={onUngroup}>ungroup</MenuItem>
      <MenuItem onClick={onDelete} data-testid="group-delete">
        delete
      </MenuItem>
    </Menu>
  );
};
