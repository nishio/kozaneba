import { Button, Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { useGlobal } from "reactn";
import { show_menu } from "../Menu/show_menu";

export const DevMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Dev";
  const onClose = () => {
    setMenu("");
  };
  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    show_menu("Dev", event);
  };
  const onHello = () => {
    alert("Hello!");
  };
  return (
    <>
      <Button color="inherit" onClick={onButtonClick}>
        DEV
      </Button>
      <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
        <MenuItem onClick={onHello}>Hello 1</MenuItem>
        <MenuItem onClick={onHello}>Hello 2</MenuItem>
        <MenuItem onClick={onHello}>Hello 3</MenuItem>
      </Menu>
    </>
  );
};
