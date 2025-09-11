import { AddKozaneDialog } from "./AddKozaneDialog/AddKozaneDialog";
import { TutorialDialog } from "./Tutorial/TutorialDialog";
import { SignDialog } from "./SignDialog";
import { CloudSaveDialog } from "./CloudSaveDialog";
import { EditGroupTitleDialog } from "./AddKozaneDialog/EditGroupTitleDialog";
import { UserDialog } from "./User/UserDialog";
import { HelpDialog } from "./Tutorial/HelpDialog";
import { LoadingDialog } from "./LoadingDialog";
import { BaDialog } from "./BaDialog";
import { EditKozaneDialog } from "./AddKozaneDialog/EditKozaneDialog";
import { UserScriptDialog } from "./User/UserScriptDialog";

export const Dialogs = () => (
  <>
    <AddKozaneDialog />
    <TutorialDialog />
    <SignDialog />
    <CloudSaveDialog />
    <EditGroupTitleDialog />
    <UserDialog />
    <HelpDialog />
    <LoadingDialog />
    <BaDialog />
    <EditKozaneDialog />
    <UserScriptDialog />
  </>
);
