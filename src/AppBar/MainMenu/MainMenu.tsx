import { IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import React from "react";
import { setGlobal, useGlobal } from "reactn";
import { kozaneba } from "../../API/KozanebaAPI";
import { UserMenuItem } from "../../API/UserMenuItem";
import { initial_save } from "../../Cloud/initial_save";
import { updateGlobal } from "../../Global/updateGlobal";
import { Sentry } from "../../initSentry";
import { show_menu } from "../../utils/show_menu";
import { close_menu_and_dialog } from "../../utils/close_menu";
import { can_write, is_cloud } from "../../utils/can_write";
// import { StartTutorial } from "./StartTutorial";

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

  const onAddKozane = () => {
    updateGlobal((g) => {
      g.dialog = "AddKozane";
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
        <MenuItem onClick={onAddKozane}>Add Kozane</MenuItem>
        <EnableCloudAutoSave />
        <User />

        <Ba />
        {/* <StartTutorial /> */}
        <SendFeedback />
        {kozaneba.user_menus["Main"]!.map(UserMenuItem)}
      </Menu>
    </>
  );
};

const Ba = () => {
  const onClick = () => {
    setGlobal({ dialog: "Ba" });
  };
  return <MenuItem onClick={onClick}>Ba</MenuItem>;
};

const SendFeedback = () => {
  const onClick = () => {
    Sentry.captureMessage("Manual Feedback " + Date.now());
    close_menu_and_dialog();
  };
  return <MenuItem onClick={onClick}>Send Feedback</MenuItem>;
};

const User = () => {
  const [user] = useGlobal("user");
  if (user !== null) {
    const onUser = () => {
      setGlobal({ dialog: "User" });
    };
    return <MenuItem onClick={onUser}>User</MenuItem>;
  }
  return null;
};

const EnableCloudAutoSave = () => {
  const [cloud_ba] = useGlobal("cloud_ba");
  if (cloud_ba === "" || in_readonly_mode()) {
    const onEnableCloudAutoSave = () => {
      initial_save();
    };
    return (
      <MenuItem onClick={onEnableCloudAutoSave}>
        Enable Cloud Auto-Save
      </MenuItem>
    );
  }
  return null;
};

export const in_readonly_mode = () => {
  return is_cloud() && !can_write();
};
