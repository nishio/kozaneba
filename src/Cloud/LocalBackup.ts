import Dexie from "dexie";
import { getGlobal } from "reactn";
import { date_to_str } from "../utils/date_to_str";
import { save_new } from "./initial_save";
import { stop_current_subscription } from "./set_up_read_subscription";

export interface IBackup {
  id?: number; // Primary key. Optional (autoincremented)
  cloud_ba: string;
  last_updated: number;
  json: string;
}

class MyAppDatabase extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  backup: Dexie.Table<IBackup, number>; // number = type of the primkey
  //...other tables goes here...

  constructor() {
    super("Kozaneba");
    this.version(2).stores({
      backup: "++id,cloud_ba,last_updated",
      //...other tables goes here...
    });
    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    this.backup = this.table("backup");
  }
}

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

export const local_db = new MyAppDatabase();
