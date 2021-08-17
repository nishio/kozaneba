import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { get_item } from "../Event/get_item";
import { updateGlobal } from "../Global/updateGlobal";
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
  const onBig = () => {
    const id = getGlobal().clicked_kozane;
    if (id === "") return;
    updateGlobal((g) => {
      const item = get_item(g, id);
      item.scale++;
    });
    setMenu("");
  };
  const onSplit = () => {
    updateGlobal((g) => {
      g.dialog = "SplitKozane";
    });
    setMenu("");
  };
  return (
    <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
      <MenuItem onClick={onBig} data-testid="kozane-big">
        Big
      </MenuItem>
      <MenuItem onClick={onSplit} data-testid="kozane-split">
        Split
      </MenuItem>
      <MenuItem onClick={onDelete} data-testid="kozane-delete">
        Delete
      </MenuItem>
    </Menu>
  );
};
