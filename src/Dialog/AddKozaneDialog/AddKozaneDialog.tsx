import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextareaAutosize,
} from "@material-ui/core";
import React, { createRef } from "react";
import { useGlobal } from "reactn";
import { constants } from "../../API/constants";
import { finishButtons } from "../../App/hotKey";
import { addTooltip } from "../../utils/addTooltip";
import { add_multiple_kozane } from "../../utils/add_multiple_kozane";

export const AddKozaneDialog = () => {
  const [dialog, setDialog] = useGlobal("dialog");
  const [text, setText] = useGlobal("add_kozane_text");
  const textarea = createRef<HTMLTextAreaElement>();
  const open = dialog === "AddKozane";
  const onClose = (e: unknown, reason?: string) => {
    if (reason === "backdropClick") return;
    setDialog("");
    setText("");
  };

  const onAddKozane = () => {
    console.log("onAddKozane", open, textarea.current);
    if (textarea.current === null) return;
    if (!open) return;
    let multiline = textarea.current.value;

    add_multiple_kozane(multiline);
  };
  finishButtons["AddKozaneDialog"] = onAddKozane;

  const fullScreen = constants.add_kozane_dialog_is_fullscreen;
  // It was true, good for edit large contents
  // Now it is false, good for tutorial player understand it is a dialog
  // It might better to be changeable in future. -> Done
  const fontSize = constants.fontsize_of_add_kozane_dialog;
  return (
    <Dialog
      open={open}
      fullWidth={true}
      fullScreen={fullScreen}
      onClose={onClose}
      disableEscapeKeyDown={true}
      data-testid="add-kozane-dialog"
    >
      <DialogTitle id="form-dialog-title">Add Kozane</DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        {/* <DialogContentText>...</DialogContentText> */}
        <div style={{ display: "flex" }}>
          <div style={{ flexGrow: 1 }}>
            <TextareaAutosize
              autoFocus
              id="multiline"
              style={{
                width: "calc(100% - 10px)",
                backgroundColor: "#eee",
                border: "none",
                fontSize,
              }}
              minRows={30}
              data-testid="textarea"
              ref={textarea}
              defaultValue={text}
            />
          </div>

          {/* <div style={{ maxWidth: "20%" }}>
            <div
              style={{
                position: "sticky",
                top: "0px",
                background: "#eee",
                padding: "2px",
              }}
            >
              Menu
              <hr />
              New Pieces:
              <hr />
              <hr />
            </div>
          </div> */}
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>

        {addTooltip(
          <Button
            color="primary"
            onClick={onAddKozane}
            data-testid="add-kozane-button"
          >
            Add Kozane
          </Button>,
          "Cmd+Enter",
          ""
        )}
      </DialogActions>
    </Dialog>
  );
};
