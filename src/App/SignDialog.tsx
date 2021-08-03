import { useGlobal } from "reactn";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import firebase from "firebase";
import { authui } from "../Cloud/FirestoreIO";

export const SignDialog = () => {
  const [dialog, setDialog] = useGlobal("dialog");
  const open = dialog === "Sign";
  const onClose = () => {
    setDialog("");
  };

  if (open) {
    authui.start("#firebaseui-auth-container", {
      signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
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
  }
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
