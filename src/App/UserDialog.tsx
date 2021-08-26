import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { useGlobal } from "reactn";
import { close_menu_and_dialog } from "../AppBar/close_menu";
import { get_display_name } from "../AppBar/UserInfo";
import { get_writable_ba } from "./get_writable_ba";
import { WritableBaList } from "./WritableBaList";

export type Ba = { title: string; id: string; last_updated: number };

export const UserDialog = () => {
  const [dialog] = useGlobal("dialog");
  const [ba_list, set_ba_list] = useState(null as Ba[] | null);
  const [user] = useGlobal("user");
  const open = dialog === "User";
  const onClose = () => {
    set_ba_list(null); // will reload when next open
    close_menu_and_dialog();
  };

  const display_name = get_display_name();
  useEffect(() => {
    if (open && user !== null && ba_list === null) {
      get_writable_ba(user.uid).then(set_ba_list);
    }
  }, [open, user, ba_list]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="user-dialog"
      keepMounted={true}
    >
      <DialogTitle id="form-dialog-title">User: {display_name}</DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>
        {WritableBaList(ba_list)}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
