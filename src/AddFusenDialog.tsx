import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextareaAutosize,
} from "@material-ui/core";
import React from "react";
import { useGlobal } from "reactn";
import { FusenItem } from "./Fusen/FusenItem";
import { updateGlobal } from "./Global/updateGlobal";

export const AddFusenDialog = () => {
  const [dialog, setDialog] = useGlobal("dialog");
  const open = dialog === "AddFusen";
  const onClose = () => {
    setDialog("");
  };
  const onAddFusens = () => {
    updateGlobal((g) => {
      const x = new FusenItem();
      x.text = "Foo";
      g.itemStore[x.id] = x;
      g.drawOrder.push(x.id);
      g.dialog = "";
    });
  };

  return (
    <Dialog
      open={open}
      fullWidth={true}
      fullScreen={true}
      onClose={onClose}
      data-testid="add-fusen-dialog"
    >
      <DialogTitle id="form-dialog-title">Add Fusens</DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        {/* <DialogContentText>...</DialogContentText> */}
        <div style={{ display: "flex" }}>
          <div style={{ flexGrow: 1 }}>
            <TextareaAutosize
              autoFocus
              id="multiline"
              style={{ width: "calc(100% - 10px)" }}
              minRows={40}
              data-testid="textarea"
            ></TextareaAutosize>
          </div>
          <div style={{ maxWidth: "20%" }}>
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
          </div>
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
          Add Fusens
        </Button>
      </DialogActions>
    </Dialog>
  );
};
