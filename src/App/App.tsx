import "./App.css";
import { TinySample } from "./TinySample";
import { Tutorial } from "./Tutorial";
import { Blank } from "./Blank";
import { Edit } from "./Edit";

function App() {
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
