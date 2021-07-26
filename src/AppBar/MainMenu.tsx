import { IconButton, Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { useGlobal } from "reactn";
import MenuIcon from "@material-ui/icons/Menu";
import { show_menu } from "../Menu/show_menu";

export const MainMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Main";
  const onClose = () => {
    setMenu("");
  };
  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    show_menu("Main", event);
  };
  const onHello = () => {
    alert("Hello!");
  };
  return (
    <>
      <IconButton
        edge="start"
        // className={classes.menuButton}
        color="inherit"
        aria-label="menu"
        onClick={onButtonClick}
      >
        <MenuIcon />
      </IconButton>
      <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
        <MenuItem onClick={onHello}>Main</MenuItem>
        <MenuItem onClick={onHello}>Hello 2</MenuItem>
        <MenuItem onClick={onHello}>Hello 3</MenuItem>
      </Menu>
    </>
  );
};
