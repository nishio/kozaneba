import { useEffect } from "react";
import { AddFusenDialog } from "../AddFusenDialog/AddFusenDialog";
import { AdjustFontSize } from "../Canvas/AdjustFontSize";
import "./App.css";
import { onWheel } from "../Event/onWheel";
import { MenuAnchor } from "../Menu/show_menu";
import { FusenMenu } from "../Menu/FusenMenu";
import { MyAppBar } from "../AppBar/MyAppBar";
import { updateGlobal } from "../Global/updateGlobal";
import { ItemCanvas } from "../Canvas/ItemCanvas";
import { SelectionMenu } from "../Menu/SelectionMenu";
import { GroupMenu } from "../Menu/GroupMenu";
import { StatusBar } from "./StatusBar";

const Blank = () => {
  return (
    <div className="App">
      <MyAppBar />
      <ItemCanvas />
      <AdjustFontSize />
      <AddFusenDialog />
      <FusenMenu />
      <SelectionMenu />
      <GroupMenu />
      <MenuAnchor />
      <StatusBar />
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
