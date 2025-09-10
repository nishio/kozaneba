import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import { useGlobal } from "reactn";
import { updateGlobal } from "../Global/updateGlobal";

export const LabelInputDialog = () => {
  const [g] = useGlobal();
  const [label, setLabel] = useState("");
  
  const isOpen = g.dialog === "label_input";
  
  const handleClose = () => {
    updateGlobal((g) => {
      g.dialog = "";
      g.mouseState = "";
    });
  };
  
  const handleConfirm = () => {
    updateGlobal((g) => {
      g.dialog = "";
      g.mouseState = "making_line";
      g.line_label = label;
    });
    setLabel("");
  };
  
  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>線にラベルを追加</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="ラベル"
          fullWidth
          variant="outlined"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleConfirm();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>キャンセル</Button>
        <Button onClick={handleConfirm} variant="contained">OK</Button>
      </DialogActions>
    </Dialog>
  );
};
