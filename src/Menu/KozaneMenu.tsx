import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { delete_item_from_world } from "./delete_item_from_world";

export const KozaneMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Kozane";
  const onClose = () => {
    setMenu("");
  };
  const onDelete = () => {
    const id = getGlobal().clicked_kozane;
    if (id === "") return;
    delete_item_from_world(id);
    setMenu("");
  };
  return (
    <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
      <MenuItem onClick={onDelete}>Delete</MenuItem>
    </Menu>
  );
};
