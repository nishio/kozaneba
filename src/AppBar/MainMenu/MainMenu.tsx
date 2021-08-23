import { IconButton, Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { setGlobal, useGlobal } from "reactn";
import MenuIcon from "@material-ui/icons/Menu";
import { show_menu } from "../../Menu/show_menu";
import { updateGlobal } from "../../Global/updateGlobal";
import { initial_save } from "../../Cloud/initial_save";
import { close_menu_and_dialog } from "../close_menu";
import { Sentry } from "../../initSentry";
import { mark_local_changed } from "../../Cloud/mark_local_changed";
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

        <Title />
        {/* <StartTutorial /> */}
        <SendFeedback />
      </Menu>
    </>
  );
};

const Title = () => {
  const [title, setTitle] = useGlobal("title");
  const onTitle = () => {
    const x = prompt(`Current Title: ${title}\nNew Title:`);
    if (x !== null) {
      setTitle(x);
      mark_local_changed();
    }
  };
  return <MenuItem onClick={onTitle}>Title: {title}</MenuItem>;
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
  if (cloud_ba === "") {
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
