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
import { FusenItem } from "../Fusen/FusenItem";
import { FUSEN_HEIGHT, FUSEN_WIDTH } from "../Fusen/fusen_constants";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";

function get_one_line(multiline: string) {
  let line;
  let m = multiline.match(/^((?:[^\r\n]|\r(?!\n))*)\n(.*)$/s);
  if (m != null) {
    line = m[1];
    multiline = m[2];
  } else {
    line = multiline;
    multiline = "";
  }
  // trim spaces
  line = line.replace(/(^\s+)|(\s+$)/g, "");
  return { multiline, line };
}

export const AddFusenDialog = () => {
  const [dialog, setDialog] = useGlobal("dialog");
  const textarea = createRef<HTMLTextAreaElement>();
  const open = dialog === "AddFusen";
  const onClose = () => {
    setDialog("");
  };

  const onAddFusens = () => {
    if (textarea.current === null) return;
    let multiline = textarea.current.value;
    let line;
    const items: string[] = [];
    while (multiline !== "") {
      ({ multiline, line } = get_one_line(multiline));

      items.push(line);
    }
    const N = items.length;
    const area = N * FUSEN_WIDTH * FUSEN_HEIGHT;
    const numX = Math.ceil(Math.sqrt(area) / FUSEN_WIDTH);
    const width = numX * FUSEN_WIDTH;
    const height = Math.ceil(N / numX) * FUSEN_HEIGHT;
    const center = [0, 0];

    updateGlobal((g) => {
      const group = new GroupItem();
      g.itemStore[group.id] = group;

      items.forEach((line, index) => {
        if (line === "") return;
        let x = index % numX;
        let y = Math.floor(index / numX);
        x *= FUSEN_WIDTH;
        y *= FUSEN_HEIGHT;

        x += center[0] - width / 2 + FUSEN_WIDTH / 2;
        y += center[1] - height / 2 + FUSEN_HEIGHT / 2;

        const fusen = new FusenItem();
        fusen.text = line;
        fusen.position = [x, y];
        g.itemStore[fusen.id] = fusen;
        group.items.push(fusen.id);
      });
      g.drawOrder.push(group.id);
      g.dialog = "";
    });
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
      data-testid="add-fusen-dialog"
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
            ></TextareaAutosize>
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
          onClick={onAddFusens}
          data-testid="add-fusen-button"
        >
          Add Kozane
        </Button>
      </DialogActions>
    </Dialog>
  );
};
