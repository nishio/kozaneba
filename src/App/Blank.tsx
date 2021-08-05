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

export const Blank = () => {
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
    </div>
  );
};
