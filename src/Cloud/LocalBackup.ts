import { getGlobal } from "reactn";
import { date_to_str } from "../utils/date_to_str";
import { save_new } from "./save_new";
import { stop_current_subscription } from "./set_up_read_subscription";
import { local_db } from "./backup_store";

// The Dexie database is in backup_store.ts; these are the console helpers.
export { local_db } from "./backup_store";
export type { IBackup } from "./backup_store";

export const show_backup = () => {
  const g = getGlobal();
  local_db.backup
    .where("cloud_ba")
    .equals(g.cloud_ba)
    .toArray()
    .then((xs) => {
      console.table(
        xs.map((x) => {
          return {
            id: x.id,
            last_updated: date_to_str(x.last_updated),
            size: x.json.length,
          };
        })
      );
    });
};

export const save_backup_as_new = (id: number, open = true) => {
  stop_current_subscription();
  local_db.backup
    .where("id")
    .equals(id)
    .first()
    .then((x) => {
      if (x === undefined) {
        console.error("not found");
        return;
      }

      const docdata = JSON.parse(x.json);
      save_new(docdata);
    });
};
