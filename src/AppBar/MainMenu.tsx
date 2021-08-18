import { IconButton, Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { useGlobal } from "reactn";
import MenuIcon from "@material-ui/icons/Menu";
import { show_menu } from "../Menu/show_menu";
import { updateGlobal } from "../Global/updateGlobal";
import { initial_save } from "../Cloud/initial_save";
import { close_menu_and_dialog } from "./close_menu";
import { Sentry } from "../initSentry";

export const MainMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const [cloud_ba] = useGlobal("cloud_ba");
  const open = menu === "Main";
  const onClose = () => {
    setMenu("");
  };
  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    show_menu("Main", event);
  };
  const onAddKozane = () => {
    updateGlobal((g) => {
      g.dialog = "AddKozane";
      g.menu = "";
    });
  };

  let EnableCloudAutoSave;
  if (cloud_ba === "") {
    const onEnableCloudAutoSave = () => {
      initial_save();
    };
    EnableCloudAutoSave = (
      <MenuItem onClick={onEnableCloudAutoSave}>
        Enable Cloud Auto-Save
      </MenuItem>
    );
  } else {
    EnableCloudAutoSave = null;
  }
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
        <MenuItem onClick={onAddKozane}>Add Kozane</MenuItem>
        {EnableCloudAutoSave}

        <MenuItem
          onClick={() => {
            Sentry.captureMessage("Manual Feedback " + Date.now());
            close_menu_and_dialog();
          }}
        >
          Send Feedback
        </MenuItem>
      </Menu>
    </>
  );
};
