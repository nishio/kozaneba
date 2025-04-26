import { getGlobal } from "reactn";
import { close_menu_and_dialog } from "../utils/close_menu";
import { db } from "./init_firebase";
import { collection, doc, deleteDoc } from "firebase/firestore";

export const delete_ba = () => {
  const g = getGlobal();
  deleteDoc(doc(collection(db, "ba"), g.cloud_ba));
  close_menu_and_dialog();
};
