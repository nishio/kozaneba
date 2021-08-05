import { useEffect } from "react";
import "./App.css";
import { onWheel } from "../Event/onWheel";
import { TinySample } from "./TinySample";
import { Tutorial } from "./Tutorial";
import { Blank } from "./Blank";
import { updateGlobal } from "../Global/updateGlobal";
import { db, docdate_to_state, DocSnap } from "../Cloud/FirestoreIO";
import { setGlobal } from "reactn";

const set_up_read_subscription = (ba: string) => {
  let unsubscribe = db
    .collection("ba")
    .doc(ba)
    .onSnapshot((doc: DocSnap) => {
      const data = doc.data();
      if (data === undefined) {
        throw new TypeError("doc.data() is undefined");
      }

      const server = docdate_to_state(data);
      // TODO: add check of last_updated
      setGlobal(server);
      updateGlobal((g) => {
        g.statusBar.type = "done";
      });
    });
  return unsubscribe;
};

const Edit: React.FC<{ ba: string }> = ({ ba }) => {
  useEffect(() => {
    console.log("loading", ba);
    updateGlobal((g) => {
      g.statusBar.type = "downloading";
      g.cloud_ba = ba;
    });
    return set_up_read_subscription(ba);
  });

  return <Blank></Blank>;
};
function App() {
  useEffect(() => {
    window.addEventListener("wheel", onWheel, { passive: false });
  }, []);

  if (document.location.hash === "") {
    return <Tutorial />; // tutorial for first visiter
  }

  const hash = new URLSearchParams(window.location.hash.substring(1));
  if (hash.has("blank")) {
    // for test, not connected to real firestore
    // may connect to local firestore emulator in test codes
    return <Blank />;
  }
  if (hash.has("tinysample")) {
    return <TinySample />;
  }
  if (hash.has("edit")) {
    const ba = hash.get("edit")!;
    return <Edit ba={ba} />;
  }

  return <></>;
}

export default App;
