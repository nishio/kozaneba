import { faCheckCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { useGlobal } from "reactn";
import { close_menu_and_dialog } from "../AppBar/close_menu";
import { can_write } from "../App/can_write";
import { READONLY_MESSAGE } from "../App/READONLY_MESSAGE";
import { dev_log } from "../utils/dev";

export const LoadingDialog = () => {
  const [dialog] = useGlobal("dialog");
  const [statusBar] = useGlobal("statusBar");
  const [message, setMessage] = useState(null as null | JSX.Element);
  const [is_loading, set_is_loading] = useState(true);
  const [to_show_close_button, set_to_show_close_button] = useState(false);

  const open = dialog === "Loading";
  dev_log("render LoadingDialog");
  useEffect(() => {
    if (open && statusBar.type === "done") {
      if (can_write()) {
        // auto-close
        close_menu_and_dialog();
      } else {
        setMessage(READONLY_MESSAGE);
        set_to_show_close_button(true);
        set_is_loading(false);
      }
    }
  }, [open, statusBar]);

  const onClose = () => {
    close_menu_and_dialog();
    // reset
    setMessage(null);
    set_is_loading(true);
    set_to_show_close_button(false);
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
      data-testid="loading-dialog"
      keepMounted={true}
    >
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        <div style={{ textAlign: "center" }}>{spinner}</div>
        {message}
      </DialogContent>
      <DialogActions>{CloseButton}</DialogActions>
    </Dialog>
  );
};
