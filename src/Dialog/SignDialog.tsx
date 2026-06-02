import { useEffect } from "react";
import { useGlobal } from "reactn";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { authui } from "../Cloud/FirestoreIO";
import { ensureFirebaseUiCss } from "../Cloud/ensureFirebaseUiCss";
import { GoogleAuthProvider } from "../Cloud/init_firebase";

export const SignDialog = () => {
  const [dialog, setDialog] = useGlobal("dialog");
  const open = dialog === "Sign";
  const onClose = () => {
    setDialog("");
  };

  useEffect(() => {
    if (!open) return;
    ensureFirebaseUiCss();
    authui.reset();
    authui.start("#firebaseui-auth-container", {
      signInOptions: [GoogleAuthProvider.PROVIDER_ID],
      tosUrl: undefined,
      privacyPolicyUrl: undefined,
      signInFlow: "popup",
      callbacks: {
        signInSuccessWithAuthResult: () => {
          setDialog("");
          return false; // mean: no redirect
        },
      },
    });
  }, [open, setDialog]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="sign-dialog"
      keepMounted={true}
    >
      <DialogTitle id="form-dialog-title">Sign in</DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        You need to sign in before you create a Ba on cloud.
        <div id="firebaseui-auth-container"></div>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
