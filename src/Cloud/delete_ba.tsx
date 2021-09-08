import { getGlobal } from "reactn";
import { close_menu_and_dialog } from "../utils/close_menu";
import { db } from "./FirestoreIO";

export const delete_ba = () => {
  const g = getGlobal();
  db.collection("ba").doc(g.cloud_ba).delete();
  close_menu_and_dialog();
};
