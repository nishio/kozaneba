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
  const g = getGlobal();
  const id = g.clicked_kozane;
  if (id === "") return null;
  const kozane = get_item(g, id);

  const onDelete = () => {
    delete_item_from_world(id);
    updateGlobal((g) => {
      g.clicked_kozane = "";
    });
    setMenu("");
  };
  const onBig = () => {
    updateGlobal((g) => {
      const item = get_item(g, id);
      item.scale++;
    });
    setMenu("");
  };
  const onSmall = () => {
    updateGlobal((g) => {
      const item = get_item(g, id);
      item.scale--;
    });
    setMenu("");
  };
  const Small =
    kozane.scale > 1 ? (
      <MenuItem onClick={onSmall} data-testid="group-small">
        small
      </MenuItem>
    ) : null;

  const onSplit = () => {
    updateGlobal((g) => {
      g.dialog = "SplitKozane";
    });
    setMenu("");
  };
  return (
    <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
      <MenuItem onClick={onBig} data-testid="kozane-big">
        big
      </MenuItem>
      {Small}
      <MenuItem onClick={onSplit} data-testid="kozane-split">
        split
      </MenuItem>
      <MenuItem onClick={onDelete} data-testid="kozane-delete">
        delete
      </MenuItem>
    </Menu>
  );
};
