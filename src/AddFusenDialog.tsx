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

export const AddFusenDialog = () => {
  const [dialog, setDialog] = useGlobal("dialog");
  const open = dialog === "AddFusen";
  const onClose = () => {
    setDialog("");
  };

  return (
    <Dialog open={open} fullWidth={true} fullScreen={true} onClose={onClose}>
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
        <Button color="primary">Import</Button>
      </DialogActions>
    </Dialog>
  );
};
