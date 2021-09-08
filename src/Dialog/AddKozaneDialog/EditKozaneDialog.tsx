import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextareaAutosize,
} from "@material-ui/core";
import React, { createRef } from "react";
import { getGlobal, useGlobal } from "reactn";
import { finishButtons } from "../../App/hotKey";
import { get_item } from "../../utils/get_item";
import { replace_multiple_kozane } from "../../utils/add_multiple_kozane";

export const EditKozaneDialog = () => {
  const [dialog, setDialog] = useGlobal("dialog");
  const textarea = createRef<HTMLTextAreaElement>();
  const open = dialog === "EditKozane";
  const onClose = () => {
    setDialog("");
  };

  const onEdit = () => {
    if (textarea.current === null) return;
    if (!open) return;
    let multiline = textarea.current.value;

    replace_multiple_kozane(multiline);
  };
  // MAY add `replace kozane` button

  finishButtons["EditKozaneDialog"] = onEdit;

  if (!open) return null;

  const g = getGlobal();
  const id = g.clicked_target;
  const item = get_item(g, id);
  const text = item.text;

  const fullScreen = false;
  // It was true, good for edit large contents
  // Now it is false, good for tutorial player understand it is a dialog
  // It might better to be changeable in future.
  return (
    <Dialog
      open={open}
      fullWidth={true}
      fullScreen={fullScreen}
      onClose={onClose}
      data-testid="edit-kozane-dialog"
    >
      <DialogTitle id="form-dialog-title">Edit Kozane</DialogTitle>
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
              }}
              minRows={1}
              data-testid="textarea"
              ref={textarea}
              defaultValue={text}
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
        <Button
          color="primary"
          onClick={onEdit}
          data-testid="edit-kozane-button"
        >
          Edit Kozane
        </Button>
      </DialogActions>
    </Dialog>
  );
};
