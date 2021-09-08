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
import { close_menu_and_dialog } from "../../utils/close_menu";
import { mark_local_changed } from "../../utils/mark_local_changed";
import { get_item } from "../../utils/get_item";
import { ItemId } from "../../Global/ItemId";
import { updateGlobal } from "../../Global/updateGlobal";
import { get_group_title } from "../../Group/Group";
import { GroupItem } from "../../Group/GroupItem";
import { move_front } from "../../utils/move_front";

const is_item_id = (id: string): id is ItemId => {
  const g = getGlobal();
  return id in g.itemStore;
};

export const EditGroupTitleDialog = () => {
  const [dialog, setDialog] = useGlobal("dialog");

  const textarea = createRef<HTMLTextAreaElement>();
  const open = dialog === "EditGroupTitle";
  const onClose = () => {
    setDialog("");
  };

  const onEditGroupTitle = () => {
    if (textarea.current === null) return;
    if (!open) return;
    const multiline = textarea.current.value;

    if (is_item_id(id)) {
      updateGlobal((g) => {
        const x = get_item(g, id);
        x.text = multiline;
      });
      move_front(id);
      mark_local_changed();
      close_menu_and_dialog();
    }
  };
  finishButtons["EditGroupTitleDialog"] = onEditGroupTitle;

  if (!open) {
    return null;
  }
  const g = getGlobal();
  const id = g.clicked_target;
  const group = g.itemStore[id] as GroupItem;
  const text = get_group_title(group);

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
      data-testid="edit-group-title-dialog"
    >
      <DialogTitle id="form-dialog-title">Edit Group Title</DialogTitle>
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
          onClick={onEditGroupTitle}
          data-testid="edit-group-title-button"
        >
          Save Change
        </Button>
      </DialogActions>
    </Dialog>
  );
};
