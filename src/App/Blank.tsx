import { AddFusenDialog } from "../AddFusenDialog/AddFusenDialog";
import { AdjustFontSize } from "../Canvas/AdjustFontSize";
import { MenuAnchor } from "../Menu/show_menu";
import { FusenMenu } from "../Menu/FusenMenu";
import { MyAppBar } from "../AppBar/MyAppBar";
import { ItemCanvas } from "../Canvas/ItemCanvas";
import { SelectionMenu } from "../Menu/SelectionMenu";
import { GroupMenu } from "../Menu/GroupMenu";
import { StatusBar } from "./StatusBar";
import { TutorialDialog } from "./TutorialDialog";
import { SignDialog } from "./SignDialog";
import { CloudSaveDialog } from "./CloudSaveDialog";
import { set_up_read_subscription } from "../Cloud/set_up_read_subscription";
import { useEffect, useGlobal } from "reactn";
import { LocalChangeWatcher } from "./LocalChangeWatcher";

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
      <AddFusenDialog />
      <TutorialDialog />
      <SignDialog />
      <CloudSaveDialog />
      <FusenMenu />
      <SelectionMenu />
      <GroupMenu />
      <MenuAnchor />
      <StatusBar />
      <LocalChangeWatcher />
    </div>
  );
};
