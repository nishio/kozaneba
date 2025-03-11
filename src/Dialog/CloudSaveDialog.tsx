import { useGlobal } from "../Global/ReactnCompat";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { authui } from "../Cloud/FirestoreIO";
import { signInAsAnonymousUser } from "../Cloud/signInAsAnonymousUser";
import { close_menu_and_dialog } from "../utils/close_menu";
import { initial_save } from "../Cloud/initial_save";
import { useEffect } from "react";
import { googleAuthProvider } from "../Cloud/init_firebase";

export const CloudSaveDialog = () => {
  const [dialog] = useGlobal("dialog");
  const open = dialog === "CloudSave";
  useEffect(() => {
    console.log("CloudSaveDialog open:", open);
  }, [open]);

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
      signInOptions: [googleAuthProvider.providerId],
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
      data-testid="cloud-save-dialog"
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
        <Button
          color="primary"
          onClick={onClose}
          data-testid="cloud-save-dialog-not-save"
        >
          Do not save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
