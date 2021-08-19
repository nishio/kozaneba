import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import { useGlobal } from "reactn";
import { get_display_name } from "../AppBar/UserInfo";
import { auth, db } from "../Cloud/FirestoreIO";

type Ba = { title: string; id: string; last_updated: number };
export const UserDialog = () => {
  const [dialog, setDialog] = useGlobal("dialog");
  const [ba_list, set_ba_list] = useState(null as Ba[] | null);
  const open = dialog === "User";
  const onClose = () => {
    set_ba_list(null); // will reload when next open
    setDialog("");
  };
  console.log(dialog, ba_list);

  const display_name = get_display_name();
  useEffect(() => {
    if (open && auth.currentUser !== null && ba_list === null) {
      const ba_list = [] as Ba[];
      db.collection("ba")
        .where("writers", "array-contains", auth.currentUser.uid)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            // ba_list.push(doc.id);
            ba_list.push({
              title: doc.data().title,
              id: doc.id,
              last_updated: doc.data().last_updated,
            });
          });
          set_ba_list(ba_list);
        });
    }
  });

  let BaList = <span>Loading...</span>;
  if (ba_list !== null) {
    if (ba_list.length === 0) {
      BaList = <span>Not saved yet</span>;
    } else {
      const items = ba_list.map((x) => (
        <ListItem
          button
          onClick={() => {
            window.open("/#edit=" + x.id, "_blank");
          }}
          style={{}}
        >
          <ListItemText
            primary={date_to_str(x.last_updated) + ": " + x.title}
          />
        </ListItem>
      ));
      BaList = (
        <List
          subheader={<ListSubheader component="div">Writable Ba</ListSubheader>}
        >
          {items}
        </List>
      );
    }
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid="user-dialog"
      keepMounted={true}
    >
      <DialogTitle id="form-dialog-title">User: {display_name}</DialogTitle>
      <DialogContent style={{ padding: "0px 24px" }}>{BaList}</DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const date_to_str = (date: number) => {
  const d = new Date(date);
  const Y = d.getFullYear();
  const M = (d.getMonth() + 1).toString().padStart(2, "0");
  const D = d.getDate().toString().padStart(2, "0");
  const H = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = `${Y}-${M}-${D} ${H}:${m}`;
  return s;
};
