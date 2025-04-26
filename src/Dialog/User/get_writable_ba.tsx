import { db } from "../../Cloud/init_firebase";
import { Ba } from "./UserDialog";


export const get_writable_ba = (uid: string) => {
  const ba_list = [] as Ba[];
  return db.collection("ba")
    .where("writers", "array-contains", uid)
    .orderBy("last_updated", "desc")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // ba_list.push(doc.id);
        const data = doc.data();
        if (data) {
          ba_list.push({
            title: data.title,
            id: doc.id,
            last_updated: data.last_updated,
          });
        }
      });
      return ba_list;
    });
};
