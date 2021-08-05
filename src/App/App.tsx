import { useEffect } from "react";
import "./App.css";
import { onWheel } from "../Event/onWheel";
import { TinySample } from "./TinySample";
import { Tutorial } from "./Tutorial";
import { Blank } from "./Blank";

const Edit = () => {
  const hash = new URLSearchParams(window.location.hash.substring(1));
  useEffect(() => {
    console.log("load", hash.get("edit"));
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
    // for test
    return <Blank />;
  }
  if (hash.has("tinysample")) {
    return <TinySample />;
  }
  if (hash.has("edit")) {
    return <Edit />;
  }

  return <></>;
}

export default App;
