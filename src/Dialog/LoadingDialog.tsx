import {
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
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
import { can_write } from "../App/can_write";
import { ERROR_MESSAGE, READONLY_MESSAGE } from "../App/READONLY_MESSAGE";
import { close_menu_and_dialog } from "../AppBar/close_menu";
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
    if (open) {
      if (statusBar.type === "done") {
        if (can_write()) {
          // auto-close
          close_menu_and_dialog();
        } else {
          setMessage(READONLY_MESSAGE);
          set_to_show_close_button(true);
          set_is_loading(false);
        }
      } else if (statusBar.type === "no-connection") {
        setMessage(ERROR_MESSAGE);
        set_to_show_close_button(true);
        set_is_loading(false);
      }
    }
  }, [open, statusBar]);

  const onClose = () => {
    close_menu_and_dialog();
    setTimeout(() => {
      // reset
      setMessage(null);
      set_is_loading(true);
      set_to_show_close_button(false);
    }, 1000); // delay not to show in fade-out animation
  };
  let CloseButton = null;
  if (to_show_close_button) {
    CloseButton = (
      <Button color="primary" onClick={onClose}>
        Close
      </Button>
    );
  }
  let title = null;
  let spinner = null;
  if (is_loading) {
    title = "Loading...";
    spinner = <FontAwesomeIcon icon={faSpinner} spin={true} size="10x" />;
  } else {
    if (statusBar.type === "done") {
      title = "Finished!";
      spinner = <FontAwesomeIcon icon={faCheckCircle} size="10x" />;
    } else {
      title = "Error!";
      spinner = <FontAwesomeIcon icon={faExclamationTriangle} size="10x" />;
    }
  }

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
