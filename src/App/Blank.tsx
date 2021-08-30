import { useEffect, useGlobal } from "reactn";
import { MyAppBar } from "../AppBar/MyAppBar";
import { AdjustFontSize } from "../Canvas/AdjustFontSize";
import { ItemCanvas } from "../Canvas/ItemCanvas";
import { set_up_read_subscription } from "../Cloud/set_up_read_subscription";
import { Menus } from "../Menu/Menus";
import { MenuAnchor } from "../Menu/show_menu";
import { Dialogs } from "./Dialogs";
import { KeyboardShortcut } from "./KeyboardShortcut";
import { LocalChangeWatcher } from "./LocalChangeWatcher";
import { StatusBar } from "./StatusBar";

export const Blank = () => {
  const [cloud_ba] = useGlobal("cloud_ba");

  useEffect(() => {
    if (cloud_ba !== "") {
      return set_up_read_subscription(cloud_ba);
    }
  }, [cloud_ba]);

  return (
    <div className="App">
      <MyAppBar />
      <ItemCanvas />
      <AdjustFontSize />
      <MenuAnchor />
      <StatusBar />
      <LocalChangeWatcher />
      <KeyboardShortcut />
      <Dialogs />
      <Menus />
    </div>
  );
};
