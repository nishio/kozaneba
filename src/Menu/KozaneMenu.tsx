import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { updateGlobal } from "../Global/updateGlobal";
import { BigSmallMenuItem } from "./BigSmallMenuItem";
import { DeleteMenuItem } from "./DeleteMenuItem";

export const KozaneMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Kozane";
  const onClose = () => {
    setMenu("");
  };
  const g = getGlobal();
  const id = g.clicked_target;
  if (id === "") return null;

  const onSplit = () => {
    updateGlobal((g) => {
      g.dialog = "SplitKozane";
    });
    setMenu("");
  };
  return (
    <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
      <BigSmallMenuItem id={id} />
      <MenuItem onClick={onSplit} data-testid="kozane-split">
        split
      </MenuItem>
      <DeleteMenuItem id={id} />
    </Menu>
  );
};
