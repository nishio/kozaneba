import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { close_menu_and_dialog } from "../AppBar/close_menu";
import { get_display_name } from "../AppBar/UserInfo";
import { db } from "../Cloud/FirestoreIO";
import { date_to_str } from "../utils/date_to_str";

type Ba = { title: string; id: string; last_updated: number };
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
      const ba_list = [] as Ba[];
      db.collection("ba")
        .where("writers", "array-contains", user.uid)
        .orderBy("last_updated", "desc")
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

const WritableBaList = (ba_list: Ba[] | null) => {
  let BaList = (
    <span>
      Loading...
      <FontAwesomeIcon icon={faSpinner} spin={true} />
    </span>
  );
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
          data-testid={`edit-link-${x.id}`}
          key={x.id}
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
  return BaList;
};
