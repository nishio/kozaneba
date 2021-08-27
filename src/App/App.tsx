import "./App.css";
import { TinySample } from "./TinySample";
import { TopPage } from "./TopPage";
import { Blank } from "./Blank";
import { Edit } from "./Edit";
import { NewBa } from "./NewBa";

function App() {
  if (document.location.hash === "") {
    return <TopPage />; // tutorial for first visiter
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
  if (hash.has("new")) {
    return <NewBa />;
  }
  if (hash.has("edit")) {
    const ba = hash.get("edit")!;
    return <Edit ba={ba} />;
  }
  if (hash.has("view")) {
    const ba = hash.get("view")!;
    return <Edit ba={ba} />;
  }

  return <></>;
}

export default App;
