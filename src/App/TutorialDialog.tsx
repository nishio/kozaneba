import { useGlobal } from "reactn";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";

export const TutorialDialog = () => {
  const [dialog, setDialog] = useGlobal("dialog");
  const open = dialog === "Tutorial";
  const onClose = () => {
    setDialog("");
  };

  return (
    <Dialog
      open={open}
      fullWidth={true}
      fullScreen={true}
      onClose={onClose}
      data-testid="tutorial-dialog"
    >
      <DialogTitle id="form-dialog-title">Tutorial</DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        <DialogContentText>Tutorial</DialogContentText>
        No contents yet.
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
