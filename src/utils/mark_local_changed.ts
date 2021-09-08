import { updateGlobal } from "../Global/updateGlobal";

export const mark_local_changed = () => {
  updateGlobal((g) => {
    g.is_local_change = true;
    g.last_updated = Date.now();
  });
};
