import { AddKozaneDialog } from "../AddKozaneDialog/AddKozaneDialog";
import { TutorialDialog } from "./Tutorial/TutorialDialog";
import { SignDialog } from "./SignDialog";
import { CloudSaveDialog } from "./CloudSaveDialog";
import { EditGroupTitleDialog } from "../AddKozaneDialog/EditGroupTitleDialog";
import { SplitKozaneDialog } from "../AddKozaneDialog/SplitKozaneDialog";
import { UserDialog } from "./User/UserDialog";
import { HelpDialog } from "./Tutorial/HelpDialog";
import { LoadingDialog } from "./LoadingDialog";
import { BaDialog } from "./BaDialog";

export const Dialogs = () => (
  <>
    <AddKozaneDialog />
    <TutorialDialog />
    <SignDialog />
    <CloudSaveDialog />
    <EditGroupTitleDialog />
    <SplitKozaneDialog />
    <UserDialog />
    <HelpDialog />
    <LoadingDialog />
    <BaDialog />
  </>
);
