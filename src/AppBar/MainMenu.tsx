import { IconButton, Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { useGlobal } from "reactn";
import MenuIcon from "@material-ui/icons/Menu";
import { show_menu } from "../Menu/show_menu";
import { updateGlobal } from "../Global/updateGlobal";

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
  const onAddFusen = () => {
    updateGlobal((g) => {
      g.dialog = "AddFusen";
      g.menu = "";
    });
  };
  return (
    <>
      <IconButton
        edge="start"
        // className={classes.menuButton}
        color="inherit"
        aria-label="menu"
        onClick={onButtonClick}
        data-testid="main-menu"
      >
        <MenuIcon />
      </IconButton>
      <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
        <MenuItem onClick={onAddFusen}>Add Kozane</MenuItem>
      </Menu>
    </>
  );
};
