import { getGlobal, useGlobal } from "reactn";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import {
  auth,
  authui,
  db,
  DocRef,
  state_to_docdate,
} from "../Cloud/FirestoreIO";
import firebase from "firebase";
import { signInAsAnonymousUser } from "../Cloud/signInAsAnonymousUser";
import { updateGlobal } from "../Global/updateGlobal";
import { close_menu_and_dialog } from "../AppBar/close_menu";
import { set_up_read_subscription } from "../Cloud/set_up_read_subscription";

export const initial_save = () => {
  console.log("initial save");
  if (auth.currentUser === null) {
    updateGlobal((g) => {
      g.dialog = "CloudSave";
    });
    return;
  }
  console.log(`save as ${auth.currentUser.displayName ?? "Anonymous"}`);
  updateGlobal((g) => {
    g.statusBar.type = "uploading";
  });

  const doc = state_to_docdate(getGlobal());
  db.collection("ba")
    .add(doc)
    .then((docRef: DocRef) => {
      updateGlobal((g) => {
        g.statusBar.type = "done";
        g.cloud_ba = docRef.id;
        window.location.hash = `edit=${docRef.id}`;
        set_up_read_subscription(g.cloud_ba);
      });
    });
};

export const CloudSaveDialog = () => {
  const [dialog] = useGlobal("dialog");
  const open = dialog === "CloudSave";
  const onClose = () => {
    close_menu_and_dialog();
  };
  const onContinue = () => {
    signInAsAnonymousUser().then(() => {
      initial_save();
      close_menu_and_dialog();
    });
  };
  if (open) {
    authui.start("#could-save-firebaseui-auth-container", {
      signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
      tosUrl: undefined,
      privacyPolicyUrl: undefined,
      signInFlow: "popup",
      callbacks: {
        signInSuccessWithAuthResult: () => {
          initial_save();
          close_menu_and_dialog();
          return false; // mean: no redirect
        },
      },
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="sign-dialog"
      keepMounted={true}
    >
      <DialogTitle id="form-dialog-title">Cloud Save</DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        To save on cloud, you need an account. You can sign in with Google
        account, or continue as an anonymous user.
        <div id="could-save-firebaseui-auth-container"></div>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={onContinue}
          data-testid="continue-as-anonymous-user"
        >
          Continue as an anonymous user
        </Button>
        <Button color="primary" onClick={onClose}>
          Do not save
        </Button>
      </DialogActions>
    </Dialog>
  );
};