import { db } from "../../Cloud/init_firebase";
import { Ba } from "./UserDialog";
import { collection, query, where, orderBy, getDocs, QuerySnapshot, DocumentData } from "firebase/firestore";

export const get_writable_ba = (uid: string) => {
  const ba_list = [] as Ba[];
  const baCollection = collection(db, "ba");
  const q = query(
    baCollection,
    where("writers", "array-contains", uid),
    orderBy("last_updated", "desc")
  );
  
  return getDocs(q)
    .then((querySnapshot: QuerySnapshot<DocumentData>) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // ba_list.push(doc.id);
        ba_list.push({
          title: doc.data().title,
          id: doc.id,
          last_updated: doc.data().last_updated,
        });
      });
      return ba_list;
    });
};
