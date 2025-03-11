import { useGlobal } from "../Global/ReactnCompat";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { SimpleAuthUI } from "../Cloud/SimpleAuthUI";

export const SignDialog = () => {
  const [dialog, setDialog] = useGlobal("dialog");
  const open = dialog === "Sign";
  const onClose = () => {
    setDialog("");
  };

  const handleAuthSuccess = () => {
    setDialog("");
  };
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
        <SimpleAuthUI onSuccess={handleAuthSuccess} />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
