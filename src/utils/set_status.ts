import { TStatusType } from "../Global/TStatusType";
import { updateGlobal } from "../Global/updateGlobal";

export const set_status = (status: TStatusType) => {
  updateGlobal((g) => {
    g.statusBar.type = status;
  });
};
