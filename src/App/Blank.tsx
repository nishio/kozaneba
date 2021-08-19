import { AddKozaneDialog } from "../AddKozaneDialog/AddKozaneDialog";
import { AdjustFontSize } from "../Canvas/AdjustFontSize";
import { MenuAnchor } from "../Menu/show_menu";
import { KozaneMenu } from "../Menu/KozaneMenu";
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
import { EditGroupTitleDialog } from "../AddKozaneDialog/EditGroupTitleDialog";
import { SplitKozaneDialog } from "../AddKozaneDialog/SplitKozaneDialog";
import { KeyboardShortcut } from "./KeyboardShortcut";
import { UserDialog } from "./UserDialog";

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
      <AddKozaneDialog />
      <TutorialDialog />
      <SignDialog />
      <CloudSaveDialog />
      <KozaneMenu />
      <SelectionMenu />
      <GroupMenu />
      <MenuAnchor />
      <StatusBar />
      <LocalChangeWatcher />
      <EditGroupTitleDialog />
      <SplitKozaneDialog />
      <KeyboardShortcut />
      <UserDialog />
    </div>
  );
};
