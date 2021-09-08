import { TStatusType } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";

export const set_status = (status: TStatusType) => {
  updateGlobal((g) => {
    g.statusBar.type = status;
  });
};
