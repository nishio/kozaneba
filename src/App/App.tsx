import { useEffect } from "react";
import "./App.css";
import { onWheel } from "../Event/onWheel";
import { TinySample } from "./TinySample";
import { Tutorial } from "./Tutorial";
import { Blank } from "./Blank";
import { updateGlobal } from "../Global/updateGlobal";
import { useGlobal } from "reactn";
import { set_up_read_subscription } from "../Cloud/set_up_read_subscription";
import { save } from "../Cloud/save";

const Edit: React.FC<{ ba: string }> = ({ ba }) => {
  const [is_loacl_change] = useGlobal("is_local_change");

  useEffect(() => {
    console.log("loading", ba);
    updateGlobal((g) => {
      g.statusBar.type = "downloading";
      g.cloud_ba = ba;
    });
    return set_up_read_subscription(ba);
  }, [ba]);

  useEffect(() => {
    if (is_loacl_change) {
      updateGlobal((g) => {
        g.is_local_change = false;
      });
      save();
    }
  }, [is_loacl_change]);

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
