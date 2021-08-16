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
import { KozaneItem } from "../Kozane/KozaneItem";
import { KOZANE_HEIGHT, KOZANE_WIDTH } from "../Kozane/kozane_constants";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { multiline_to_lines } from "./multiline_to_lines";

export const AddKozaneDialog = () => {
  const [dialog, setDialog] = useGlobal("dialog");
  const [text, setText] = useGlobal("add_kozane_text");
  const textarea = createRef<HTMLTextAreaElement>();
  const open = dialog === "AddKozane";
  const onClose = () => {
    setDialog("");
    setText("");
  };

  const onAddKozane = () => {
    if (textarea.current === null) return;
    let multiline = textarea.current.value;

    add_multiple_kozane(multiline);
  };

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
        <Button
          color="primary"
          onClick={onAddKozane}
          data-testid="add-kozane-button"
        >
          Add Kozane
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const add_multiple_kozane = (multiline: string) => {
  const items = multiline_to_lines(multiline);
  const N = items.length;
  const area = N * KOZANE_WIDTH * KOZANE_HEIGHT;
  const numX = Math.ceil(Math.sqrt(area) / KOZANE_WIDTH);
  const width = numX * KOZANE_WIDTH;
  const height = Math.ceil(N / numX) * KOZANE_HEIGHT;
  const center = [0, 0];

  updateGlobal((g) => {
    const group = new GroupItem();
    g.itemStore[group.id] = group;

    items.forEach((line, index) => {
      if (line === "") return;
      let x = index % numX;
      let y = Math.floor(index / numX);
      x *= KOZANE_WIDTH;
      y *= KOZANE_HEIGHT;

      x += center[0] - width / 2 + KOZANE_WIDTH / 2;
      y += center[1] - height / 2 + KOZANE_HEIGHT / 2;

      const kozane = new KozaneItem();
      kozane.text = line;
      kozane.position = [x, y];
      g.itemStore[kozane.id] = kozane;
      group.items.push(kozane.id);
    });
    group.position = [-g.trans_x, -g.trans_y];
    g.drawOrder.push(group.id);
    g.dialog = "";
    g.add_kozane_text = "";
  });
};
