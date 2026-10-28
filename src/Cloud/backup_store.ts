import Dexie from "dexie";
import { constants } from "../API/constants";
import { DocData } from "./FirebaseShortTypename";
import {
  select_over_cap,
  select_thinned,
  TBackupMeta,
} from "./backup_policy";

// Local backups of each cloud Ba in IndexedDB (D1 / D8).
// `backup` holds the JSON (as before); `backup_meta` holds what the restore
// list and the thinning need, so neither has to load the JSON.

export interface IBackup {
  id?: number; // Primary key. Optional (autoincremented)
  cloud_ba: string;
  last_updated: number;
  json: string;
}

class MyAppDatabase extends Dexie {
  backup: Dexie.Table<IBackup, number>;
  backup_meta: Dexie.Table<TBackupMeta, number>;

  constructor() {
    super("Kozaneba");
    this.version(2).stores({
      backup: "++id,cloud_ba,last_updated",
    });
    this.version(3)
      .stores({
        backup: "++id,cloud_ba,last_updated",
        backup_meta: "id,cloud_ba",
      })
      .upgrade(async (tx) => {
        // backups taken before this version (to_make_local_backup = true)
        const metas: TBackupMeta[] = [];
        await tx
          .table("backup")
          .toCollection()
          .each((x: IBackup) => {
            metas.push(make_meta(x.id!, x.cloud_ba, x.last_updated, x.json));
          });
        await tx.table("backup_meta").bulkAdd(metas);
      });
    this.backup = this.table("backup");
    this.backup_meta = this.table("backup_meta");
  }
}

export const local_db = new MyAppDatabase();

const count_items = (json: string) => {
  try {
    const x = JSON.parse(json);
    return Object.keys(x?.itemStore ?? {}).length;
  } catch (e) {
    return 0;
  }
};

const make_meta = (
  id: number,
  cloud_ba: string,
  saved_at: number,
  json: string
): TBackupMeta => ({
  id,
  cloud_ba,
  saved_at,
  size: json.length,
  n_items: count_items(json),
});

// one prune at a time
let pruning: Promise<void> = Promise.resolve();

export const add_backup = (
  cloud_ba: string,
  doc: DocData,
  now = Date.now()
): Promise<void> => {
  const json = JSON.stringify(doc);
  const n_items = Object.keys(doc.itemStore ?? {}).length;
  const p = local_db
    .transaction("rw", local_db.backup, local_db.backup_meta, async () => {
      const id = await local_db.backup.add({
        cloud_ba,
        last_updated: doc.last_updated,
        json,
      });
      await local_db.backup_meta.add({
        id,
        cloud_ba,
        saved_at: now,
        size: json.length,
        n_items,
      });
    })
    .then(() => {
      pruning = pruning.then(() => prune(cloud_ba, now)).catch(warn);
      return pruning;
    });
  return p.catch(warn);
};

// to_make_local_backup can be turned off by a user script
export const backup_if_enabled = (cloud_ba: string, doc: DocData) => {
  if (constants.to_make_local_backup) return add_backup(cloud_ba, doc);
  return Promise.resolve();
};

const warn = (e: unknown) => {
  console.warn("local backup failed", e);
};

const delete_backups = (ids: number[]) =>
  local_db.transaction("rw", local_db.backup, local_db.backup_meta, async () => {
    await local_db.backup.bulkDelete(ids);
    await local_db.backup_meta.bulkDelete(ids);
  });

export const prune = async (cloud_ba: string, now = Date.now()) => {
  const of_ba = await local_db.backup_meta
    .where("cloud_ba")
    .equals(cloud_ba)
    .toArray();
  const thinned = select_thinned(of_ba, now);
  if (thinned.length > 0) await delete_backups(thinned);
  const all = await local_db.backup_meta.toArray();
  const over = select_over_cap(all);
  if (over.length > 0) await delete_backups(over);
};

// newest first
export const list_backups = async (cloud_ba: string) => {
  const xs = await local_db.backup_meta
    .where("cloud_ba")
    .equals(cloud_ba)
    .toArray();
  return xs.sort((a, b) => b.saved_at - a.saved_at);
};

export const get_backup_doc = async (id: number): Promise<DocData | null> => {
  const x = await local_db.backup.get(id);
  if (x === undefined) return null;
  return JSON.parse(x.json);
};
