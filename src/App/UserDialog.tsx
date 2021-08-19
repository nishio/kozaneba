import { useGlobal } from "reactn";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { get_display_name } from "../AppBar/UserInfo";
import { useState } from "react";
import { useEffect } from "react";
import { auth, db } from "../Cloud/FirestoreIO";

type Ba = { title: string; id: string };
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
      BaList = (
        <ul>
          {ba_list.map((x) => (
            <li key={x.id}>
              <a href={"/#edit=" + x.id} target="blank">
                {x.title}
              </a>
            </li>
          ))}
        </ul>
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
