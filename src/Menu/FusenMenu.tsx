import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { useGlobal } from "reactn";
import { updateGlobal } from "../Global/updateGlobal";
import { remove_item } from "../utils/remove_item";

export const FusenMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Fusen";
  const onClose = () => {
    setMenu("");
  };
  const onDelete = () => {
    updateGlobal((g) => {
      if (g.clicked_fusen !== "") {
        delete g.itemStore[g.clicked_fusen];
        g.drawOrder = remove_item(g.drawOrder, g.clicked_fusen);
      }
    });
    setMenu("");
  };
  return (
    <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
      <MenuItem onClick={onDelete}>Delete</MenuItem>
    </Menu>
  );
};
