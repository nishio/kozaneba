import { useEffect } from "react";
import { AddFusenDialog } from "./AddFusenDialog";
import { AdjustFontSize } from "./AdjustFontSize";
import "./App.css";
import { onWheel } from "./onWheel";
import { MenuAnchor } from "./show_menu";
import { FusenMenu } from "./FusenMenu";
import { MyAppBar } from "./MyAppBar";
import { updateGlobal } from "./updateGlobal";
import { ItemCanvas } from "./ItemCanvas";

const Blank = () => {
  return (
    <div className="App">
      <MyAppBar />
      <ItemCanvas />
      <AdjustFontSize />
      <AddFusenDialog />
      <FusenMenu />
      <MenuAnchor />
    </div>
  );
};

const Tutorial = () => {
  useEffect(() => {
    updateGlobal((g) => {
      g.dialog = "AddFusen";
    });
  });
  return <Blank />;
};

function App() {
  useEffect(() => {
    window.addEventListener("wheel", onWheel, { passive: false });
  }, []);

  const hash = window.location.hash;
  if (hash === "#blank") {
    return <Blank />;
  }
  if (hash === "") {
    return <Tutorial />; // tutorial for first visiter
  }
  // TODO: parse hash
  return <></>;
}

export default App;
