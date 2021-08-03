import { Button, Divider, makeStyles, Menu, MenuItem } from "@material-ui/core";
import firebase from "firebase";
import React from "react";
import { useGlobal } from "reactn";
import { auth, showCurrentUser } from "../Cloud/FirestoreIO";
import { updateGlobal } from "../Global/updateGlobal";
import { show_menu } from "../Menu/show_menu";
import { GroupHeader } from "./GroupHeader";
import { Info } from "./Info";
import { UserInfo } from "./UserInfo";

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
  const onA = () => {
    showCurrentUser();
  };

  const onB = () => {
    console.log("login annonymously");
    firebase
      .auth()
      .signInAnonymously()
      .then(() => {
        console.log("done");
        console.log(auth.currentUser);
        // @ts-ignore
        window.user = auth.currentUser;
        // Signed in..
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });
  };
  const onC = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        console.log("signed out");
        // @ts-ignore
        window.user = auth.currentUser;
      })
      .catch((error) => {
        // An error happened.
      });
  };

  const onD = () => {
    updateGlobal((g) => {
      g.dialog = "Sign";
    });
  };

  const onGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        // const credential: firebase.auth.OAuthCredential = result.credential!;
      })
      .catch((error) => {
        throw error;
      });
  };

  return (
    <>
      <Button
        color="inherit"
        onClick={onButtonClick}
        style={{ marginLeft: "2em" }}
        className={classess.root}
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
        <MenuItem onClick={onA}>Show Current User</MenuItem>
        <MenuItem onClick={onB}>Annonymous Sign In</MenuItem>
        <MenuItem onClick={onGoogle}>Google Sign In</MenuItem>
        <MenuItem onClick={onC}>Sign Out</MenuItem>
        <MenuItem onClick={onD}>Show Sign-in Dialog</MenuItem>
      </Menu>
    </>
  );
};
