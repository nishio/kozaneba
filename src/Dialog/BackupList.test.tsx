// D1 / D8: local backups are on by default, and the Ba dialog can load one
// back. These tests render the real Edit page (subscription, watcher, save,
// menu, Ba dialog) against an in-memory Firestore, and check what reaches
// that Firestore. The IndexedDB layer (backup_store) is replaced by an
// in-memory store with the same functions; the real Dexie code is checked by
// cypress/e2e/kozaneba/local_backup.cy.ts in a browser.
import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getGlobal, setGlobal } from "reactn";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Edit } from "../App/Edit";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { mark_local_changed } from "../utils/mark_local_changed";
import { reset_sync_version } from "../Cloud/sync_version";

const fake = vi.hoisted(() => {
  type Doc = { [key: string]: unknown };
  type Listener = (snap: unknown) => void;
  const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
  const fs = {
    docs: new Map<string, Doc>(),
    listeners: new Map<string, Set<Listener>>(),
    writes: [] as Doc[],
    reset() {
      fs.docs.clear();
      fs.listeners.clear();
      fs.writes = [];
    },
    deliver(id: string, cb: Listener) {
      const v = fs.docs.get(id);
      cb({
        id,
        data: () => (v === undefined ? undefined : clone(v)),
        metadata: { hasPendingWrites: false },
      });
    },
  };
  const doc_ref = (id: string) => ({
    id,
    onSnapshot(cb: Listener) {
      if (!fs.listeners.has(id)) fs.listeners.set(id, new Set());
      fs.listeners.get(id)!.add(cb);
      setTimeout(() => {
        if (fs.listeners.get(id)?.has(cb)) fs.deliver(id, cb);
      }, 0);
      return () => fs.listeners.get(id)?.delete(cb);
    },
    set(doc: Doc) {
      fs.writes.push(clone(doc));
      fs.docs.set(id, clone(doc));
      for (const cb of fs.listeners.get(id) ?? []) fs.deliver(id, cb);
      return Promise.resolve();
    },
  });
  const db = {
    collection: () => ({ doc: doc_ref, add: () => Promise.reject(new Error("not used")) }),
    // save() reads the server version and writes in a transaction (#98);
    // nothing else writes here, so it commits on the first attempt
    async runTransaction(fn: (t: unknown) => Promise<unknown>) {
      const writes: [string, Doc][] = [];
      const result = await fn({
        get: async (ref: { id: string }) => {
          const v = fs.docs.get(ref.id);
          return { exists: v !== undefined, data: () => (v === undefined ? undefined : clone(v)) };
        },
        set: (ref: { id: string }, doc: Doc) => {
          writes.push([ref.id, clone(doc)]);
        },
      });
      for (const [id, doc] of writes) await doc_ref(id).set(doc);
      return result;
    },
    settings: () => {},
  };
  const auth = {
    currentUser: { uid: "me", displayName: "me" },
    onAuthStateChanged: () => () => {},
  };

  // in-memory stand-in for backup_store (IndexedDB)
  const store = {
    rows: [] as { id: number; cloud_ba: string; saved_at: number; json: string }[],
    next_id: 1,
    clock: 1800000000000,
  };
  const add_backup = (cloud_ba: string, doc: Doc) => {
    const json = JSON.stringify(doc);
    store.rows.push({ id: store.next_id++, cloud_ba, saved_at: store.clock++, json });
    return Promise.resolve();
  };
  return { fs, db, auth, store, add_backup, clone };
});

vi.mock("../Cloud/init_firebase", () => ({
  db: fake.db,
  auth: fake.auth,
  GoogleAuthProvider: { PROVIDER_ID: "google.com" },
}));
vi.mock("firebaseui", () => ({ auth: { AuthUI: class { start() {} reset() {} } } }));
vi.mock("../Cloud/backup_store", async () => {
  const { constants } = await vi.importActual<typeof import("../API/constants")>("../API/constants");
  const { store, add_backup } = fake;
  return {
    add_backup,
    backup_if_enabled: (ba: string, doc: object) =>
      constants.to_make_local_backup ? add_backup(ba, doc as never) : Promise.resolve(),
    list_backups: (ba: string) =>
      Promise.resolve(
        store.rows
          .filter((r) => r.cloud_ba === ba)
          .map((r) => ({
            id: r.id,
            cloud_ba: r.cloud_ba,
            saved_at: r.saved_at,
            size: r.json.length,
            n_items: Object.keys(JSON.parse(r.json).itemStore ?? {}).length,
          }))
          .sort((a, b) => b.saved_at - a.saved_at)
      ),
    get_backup_doc: (id: number) => {
      const r = store.rows.find((r) => r.id === id);
      return Promise.resolve(r === undefined ? null : JSON.parse(r.json));
    },
    local_db: {},
  };
});

const { fs, store } = fake;

const kozane = (id: string, text: string) => ({
  type: "kozane",
  id,
  text,
  position: [0, 0],
  scale: 1,
});

const my_ba = () => ({
  version: 3,
  itemStore: { k1: kozane("k1", "eighty kozane"), k2: kozane("k2", "and more") },
  drawOrder: ["k1", "k2"],
  last_updated: 1700000000000,
  anyone_writable: false,
  title: "my ba",
  writers: ["me"],
  annotations: [],
  scrapbox: "",
});

const flush = async () => {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
  }
};

// The destructive operation itself is not under test: change the state as
// the delete menu does (remove + mark_local_changed).
const delete_everything = async () => {
  await act(async () => {
    setGlobal({ itemStore: {}, drawOrder: [] });
    mark_local_changed();
  });
  await flush();
};

const open_ba_dialog = async () => {
  await userEvent.click(screen.getByTestId("main-menu"));
  await userEvent.click(await screen.findByRole("menuitem", { name: "Ba" }));
  const dialog = await screen.findByTestId("ba-dialog");
  const list = within(dialog).getByTestId("backup-list");
  await userEvent.click(within(list).getByText(/Restore from backups/));
  return list;
};

beforeEach(async () => {
  fs.reset();
  reset_sync_version(); // a new page load
  store.rows = [];
  store.next_id = 1;
  fs.docs.set("ba1", my_ba());
  await act(async () => {
    setGlobal({
      ...INITIAL_GLOBAL_STATE,
      language: "en",
      show_devmenu: false,
      user: { uid: "me" } as never,
    });
  });
});
afterEach(() => {
  cleanup();
});

describe("local backup", () => {
  test("is on by default: each save is also kept on this device", async () => {
    render(<Edit ba="ba1" />);
    await flush();
    await delete_everything();
    // the save reached Firestore ...
    expect(fs.docs.get("ba1")!.drawOrder).toEqual([]);
    // ... and the same doc was kept locally
    const last = store.rows[store.rows.length - 1]!;
    expect(last.cloud_ba).toBe("ba1");
    expect(JSON.parse(last.json).drawOrder).toEqual([]);
  });

  test("the state loaded from the server is kept before the first edit", async () => {
    render(<Edit ba="ba1" />);
    await flush();
    expect(fs.writes).toEqual([]);
    expect(store.rows.map((r) => [r.cloud_ba, JSON.parse(r.json).drawOrder])).toEqual([
      ["ba1", ["k1", "k2"]],
    ]);
  });

  test("Load in the Ba dialog brings back the version before a mistaken delete, via the normal save", async () => {
    render(<Edit ba="ba1" />);
    await flush();
    // the Ba was renamed after the backup was taken
    await act(async () => {
      setGlobal({ title: "renamed" });
      mark_local_changed();
    });
    await flush();
    await delete_everything();
    expect(fs.docs.get("ba1")!.itemStore).toEqual({});
    const writes_before = fs.writes.length;

    const list = await open_ba_dialog();
    const rows = await within(list).findAllByRole("listitem");
    // newest first: after the delete (0 items), after the rename, the loaded state
    expect(rows.map((r) => r.textContent)).toEqual([
      expect.stringMatching(/\(0 items/),
      expect.stringMatching(/\(2 items/),
      expect.stringMatching(/\(2 items/),
    ]);
    await userEvent.click(within(rows[2]!).getByRole("button", { name: "Load" }));
    await flush();

    // the restored contents reached Firestore through save()
    expect(fs.writes.length).toBe(writes_before + 1);
    const saved = fs.docs.get("ba1")!;
    expect(saved.drawOrder).toEqual(["k1", "k2"]);
    expect(Object.keys(saved.itemStore as object).sort()).toEqual(["k1", "k2"]);
    // title / writers / sharing are the current ones, not the backup's
    expect(saved.title).toBe("renamed");
    expect(saved.writers).toEqual(["me"]);
    expect(saved.anyone_writable).toBe(false);
    expect(getGlobal().cloud_ba).toBe("ba1");
    expect(screen.getByTestId("backup-restored")).toBeInTheDocument();
    // the contents before the load are kept too, so the load can be undone
    const before_load = store.rows.filter((r) => JSON.parse(r.json).drawOrder.length === 0);
    expect(before_load.length).toBeGreaterThanOrEqual(2);
  });

  test("the list is not shown for a Ba this user cannot write", async () => {
    fs.docs.set("ba1", { ...my_ba(), writers: ["someone else"] });
    render(<Edit ba="ba1" />);
    await flush();
    await userEvent.click(screen.getByTestId("main-menu"));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Ba" }));
    const dialog = await screen.findByTestId("ba-dialog");
    expect(within(dialog).queryByTestId("backup-list")).toBeNull();
    // and nothing was backed up for it
    expect(store.rows).toEqual([]);
  });
});
