import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { useGlobal } from "reactn";

export const FusenMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Fusen";
  const onClose = () => {
    setMenu("");
  };
  return (
    <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
      <MenuItem>Fusen Menu 1</MenuItem>
      <MenuItem>Fusen Menu 2</MenuItem>
      <MenuItem>Fusen Menu 3</MenuItem>
    </Menu>
  );
};
