import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { useGlobal } from "reactn";
import { close_menu_and_dialog } from "../AppBar/close_menu";

export const LoadingDialog = () => {
  const [dialog] = useGlobal("dialog");
  const [statusBar] = useGlobal("statusBar");
  const open = dialog === "Loading";
  if (open && statusBar.type === "done") {
    // currently no "read-only message"
    close_menu_and_dialog();
  }
  const onClose = () => {
    close_menu_and_dialog();
  };
  let CloseButton = null;
  if (false) {
    CloseButton = (
      <Button color="primary" onClick={onClose}>
        Close
      </Button>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="user-dialog"
      keepMounted={true}
    >
      <DialogTitle id="form-dialog-title">Loading...</DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        <FontAwesomeIcon icon={faSpinner} spin={true} size="10x" />
      </DialogContent>
      <DialogActions>{CloseButton}</DialogActions>
    </Dialog>
  );
};
