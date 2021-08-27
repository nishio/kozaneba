import { faCheckCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { useState } from "react";
import { useEffect } from "react";
import { useGlobal } from "reactn";
import { close_menu_and_dialog } from "../AppBar/close_menu";
import { can_write } from "./can_write";

export const LoadingDialog = () => {
  const [dialog] = useGlobal("dialog");
  const [statusBar] = useGlobal("statusBar");
  const [message, setMessage] = useState("");
  const [is_loading, set_is_loading] = useState(true);
  const [to_show_close_button, set_to_show_close_button] = useState(false);

  const open = dialog === "Loading";

  useEffect(() => {
    if (open && statusBar.type === "done") {
      // currently no "read-only message"
      // FUTURE: when some message to show visiter exists, do not close
      if (can_write()) {
        // auto-close
        close_menu_and_dialog();
      } else {
        setMessage(
          "This ba is for viewing only. You can edit it, but it will not be saved."
        );
        set_to_show_close_button(true);
        set_is_loading(false);
      }
    }
  }, [open, statusBar]);

  const onClose = () => {
    close_menu_and_dialog();
  };
  let CloseButton = null;
  if (to_show_close_button) {
    CloseButton = (
      <Button color="primary" onClick={onClose}>
        Close
      </Button>
    );
  }

  const title = is_loading ? "Loading..." : "Finished!";
  const spinner = is_loading ? (
    <FontAwesomeIcon icon={faSpinner} spin={true} size="10x" />
  ) : (
    <FontAwesomeIcon icon={faCheckCircle} size="10x" />
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="user-dialog"
      keepMounted={true}
    >
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        <div style={{ textAlign: "center" }}>{spinner}</div>
        <p>{message}</p>
      </DialogContent>
      <DialogActions>{CloseButton}</DialogActions>
    </Dialog>
  );
};
