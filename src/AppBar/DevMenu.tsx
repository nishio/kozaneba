import { Button, makeStyles, Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { useGlobal } from "reactn";
import { updateGlobal } from "../Global/updateGlobal";
import { show_menu } from "../Menu/show_menu";
import { GroupHeader } from "./GroupHeader";
import { Info } from "./Info";
import { signInAsAnonymousUser } from "../Cloud/signInAsAnonymousUser";
import { UserInfo } from "./UserInfo";
import { onGoogleSignIn } from "./onGoogleSignIn";
import { signOut } from "./signOut";
import { initial_save } from "../App/initial_save";
import { toUseEmulator } from "../Global/exposeGlobal";
import { close_menu_and_dialog } from "./close_menu";
import { initSentry } from "../initSentry";

const useStyles = makeStyles({
  root: {
    "& .MuiButton-label": {
      border: "solid",
    },
  },
});

export const DevMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const classess = useStyles();
  const [show_devmenu] = useGlobal("show_devmenu");
  if (!show_devmenu) {
    return null;
  }
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
  const triggerCloudSave = () => {
    initial_save();
  };

  const showSignInDialog = () => {
    updateGlobal((g) => {
      g.dialog = "Sign";
    });
  };

  const onCloudSave = () => {
    updateGlobal((g) => {
      g.dialog = "CloudSave";
    });
  };

  const onUseFirestoreEmulator = () => {
    toUseEmulator();
  };
  return (
    <>
      <Button
        color="inherit"
        onClick={onButtonClick}
        style={{ marginLeft: "auto" }}
        className={classess.root}
        data-testid="dev-menu"
      >
        DEV
      </Button>
      <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
        <GroupHeader>Developer Menu</GroupHeader>
        <MenuItem onClick={onHello}>Hello!</MenuItem>

        <GroupHeader className="MuiListItem-root MuiListItem-gutters">
          User
        </GroupHeader>
        <Info>
          Current User: <UserInfo />
        </Info>
        <MenuItem onClick={signInAsAnonymousUser}>Annonymous Sign In</MenuItem>
        <MenuItem onClick={onGoogleSignIn}>Google Sign In</MenuItem>
        <MenuItem onClick={signOut} data-testid="sign-out">
          Sign Out
        </MenuItem>
        <MenuItem onClick={showSignInDialog}>Show Sign-in Dialog</MenuItem>
        <MenuItem onClick={onCloudSave}>Show Cloud Save Dialog</MenuItem>
        <MenuItem onClick={triggerCloudSave}>Trigger Cloud Save</MenuItem>
        <MenuItem onClick={onUseFirestoreEmulator}>
          Use Firestore Emulator
        </MenuItem>

        <MenuItem onClick={initSentry}>init Sentry</MenuItem>

        <MenuItem
          onClick={() => {
            close_menu_and_dialog();
            throw new Error("forced error");
          }}
        >
          Force error
        </MenuItem>
      </Menu>
    </>
  );
};
