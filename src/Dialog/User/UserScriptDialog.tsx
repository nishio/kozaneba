import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextareaAutosize,
} from "@material-ui/core";
import { useRef, useState } from "react";
import { useGlobal } from "reactn";
import { close_menu_and_dialog } from "../../utils/close_menu";

export type Ba = { title: string; id: string; last_updated: number };

export const UserScriptDialog = () => {
  const [dialog] = useGlobal("dialog");
  const [code] = useState(localStorage.getItem("onLoad") ?? "");
  const ref = useRef<HTMLTextAreaElement>(null);

  const open = dialog === "UserScript";
  const onClose = () => {
    close_menu_and_dialog();
  };

  const onRun = () => {
    try {
      console.log("Run UserScript");
      // eslint-disable-next-line no-eval
      eval(ref.current!.value);
      console.log("OK");
    } catch (error) {
      console.error(error);
    }
  };
  const onSave = () => {
    localStorage.setItem("onLoad", ref.current!.value);
    console.log("Saved");
  };
  const onSample = () => {
    window.open(
      "https://github.com/nishio/kozaneba/blob/main/src/API/sample/sample_as_javascript.js",
      "_blank"
    );
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="user-dialog"
      keepMounted={false}
      fullWidth={true}
    >
      <DialogTitle id="form-dialog-title">
        UserScript
        <Button
          color="primary"
          onClick={onRun}
          style={{ border: "1px solid", marginLeft: "2em" }}
        >
          Run
        </Button>
        <Button
          color="primary"
          onClick={onSave}
          style={{ border: "1px solid" }}
        >
          Save
        </Button>
        <Button
          color="primary"
          onClick={onSample}
          style={{ border: "1px solid" }}
        >
          Sample
        </Button>
      </DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        <TextareaAutosize
          ref={ref}
          defaultValue={code}
          style={{
            width: "100%",
            backgroundColor: "#eee",
            border: "none",
          }}
          spellCheck={false}
        />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
