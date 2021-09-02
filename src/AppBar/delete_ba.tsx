import { getGlobal } from "reactn";
import { close_menu_and_dialog } from "./close_menu";
import { db } from "../Cloud/FirestoreIO";

export const delete_ba = () => {
  const g = getGlobal();
  db.collection("ba").doc(g.cloud_ba).delete();
  close_menu_and_dialog();
};
