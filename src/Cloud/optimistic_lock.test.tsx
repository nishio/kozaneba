// D3 / D14: the whole-doc save must not silently overwrite a version saved
// elsewhere (another device, another tab, a sleeping tab that woke up), and
// the listener must not silently drop local changes that are not saved yet.
// These tests render the real Edit page (subscription, LocalChangeWatcher,
// save, alerts) against an in-memory Firestore that supports transactions,
// and check what the server ends up with.
// Mocks: Cloud/init_firebase (fake db / auth), firebaseui, Cloud/backup_store
// (records the local backups instead of IndexedDB).
import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getGlobal, setGlobal } from "reactn";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Edit } from "../App/Edit";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { mark_local_changed } from "../utils/mark_local_changed";
import { constants } from "../API/constants";
import { SAVE_RETRY } from "./save";
import { reset_sync_version } from "./sync_version";

const fake = vi.hoisted(() => {
  type Doc = { [key: string]: unknown };
  type Listener = (snap: unknown) => void;
  const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
  const fs = {
    docs: new Map<string, Doc>(),
    listeners: new Map<string, Set<Listener>>(),
    // a sleeping tab: snapshots are not delivered to it
    asleep: false,
    // commits wait for this (a write in flight)
    gate: null as null | Promise<void>,
    // the next write fails with this error
    fail_next: null as null | { code: string; message: string },
    added: [] as Doc[],
    reset() {
      fs.docs.clear();
      fs.listeners.clear();
      fs.asleep = false;
      fs.gate = null;
      fs.fail_next = null;
      fs.added = [];
    },
    deliver(id: string, cb: Listener) {
      if (fs.asleep) return;
      const v = fs.docs.get(id);
      cb({
        id,
        data: () => (v === undefined ? undefined : clone(v)),
        metadata: { hasPendingWrites: false },
      });
    },
    commit(id: string, doc: Doc | undefined) {
      if (doc === undefined) fs.docs.delete(id);
      else fs.docs.set(id, clone(doc));
      for (const cb of fs.listeners.get(id) ?? []) fs.deliver(id, cb);
    },
    async take_failure() {
      if (fs.gate !== null) await fs.gate;
      const f = fs.fail_next;
      fs.fail_next = null;
      if (f !== null) throw f;
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
    // a blind whole-doc write (what save() did before)
    async set(doc: Doc) {
      await fs.take_failure();
      fs.commit(id, doc);
    },
  });
  const db = {
    collection: () => ({
      doc: doc_ref,
      add: async (doc: Doc) => {
        fs.added.push(clone(doc));
        fs.commit("copy1", doc);
        return doc_ref("copy1");
      },
    }),
    // Like Firestore: reads see the server, writes apply at commit, and a
    // commit fails (and the function is retried) if the doc read changed.
    async runTransaction(fn: (t: unknown) => Promise<unknown>) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const read: { [id: string]: string } = {};
        const writes: [string, Doc][] = [];
        const t = {
          get: async (ref: { id: string }) => {
            const v = fs.docs.get(ref.id);
            read[ref.id] = JSON.stringify(v ?? null);
            return { exists: v !== undefined, data: () => (v === undefined ? undefined : clone(v)) };
          },
          set: (ref: { id: string }, doc: Doc) => {
            writes.push([ref.id, clone(doc)]);
          },
        };
        const result = await fn(t);
        await fs.take_failure();
        const changed = Object.entries(read).some(
          ([id, s]) => JSON.stringify(fs.docs.get(id) ?? null) !== s
        );
        if (changed) continue;
        writes.forEach(([id, doc]) => fs.commit(id, doc));
        return result;
      }
      throw { code: "aborted", message: "too much contention" };
    },
    settings: () => {},
  };
  const auth = {
    currentUser: { uid: "me", displayName: "me" },
    onAuthStateChanged: () => () => {},
  };
  const backups: string[] = [];
  return { fs, db, auth, backups, clone };
});

vi.mock("./init_firebase", () => ({
  db: fake.db,
  auth: fake.auth,
  GoogleAuthProvider: { PROVIDER_ID: "google.com" },
}));
vi.mock("firebaseui", () => ({ auth: { AuthUI: class { start() {} reset() {} } } }));
vi.mock("./backup_store", () => ({
  add_backup: (_ba: string, doc: unknown) => {
    fake.backups.push(JSON.stringify(doc));
    return Promise.resolve();
  },
  backup_if_enabled: () => Promise.resolve(),
  list_backups: () => Promise.resolve([]),
  get_backup_doc: () => Promise.resolve(null),
  local_db: {},
}));

const { fs, backups } = fake;

const kozane = (id: string, text: string, x = 0) => ({
  type: "kozane",
  id,
  text,
  position: [x, 0],
  scale: 1,
});

const T0 = Date.now() - 60 * 60 * 1000; // opened an hour ago

const ba_v1 = () => ({
  version: 3,
  itemStore: { k1: kozane("k1", "first") },
  drawOrder: ["k1"],
  last_updated: T0,
  anyone_writable: false,
  title: "my ba",
  writers: ["me"],
  annotations: [],
  scrapbox: "",
});

// another device saves the Ba (it saw v1): adds k2
const other_device_saves = async (last_updated: number) => {
  await act(async () => {
    fs.commit("ba1", {
      ...ba_v1(),
      itemStore: { k1: kozane("k1", "first"), k2: kozane("k2", "an hour of work on the iPad") },
      drawOrder: ["k1", "k2"],
      last_updated,
    });
  });
};

const flush = async () => {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
  }
};

// a local edit, as an item operation does it (change + mark_local_changed)
const edit = async (id: string, text: string) => {
  await act(async () => {
    const g = getGlobal();
    setGlobal({
      itemStore: { ...g.itemStore, [id]: kozane(id, text, 100) as never },
      drawOrder: (g.drawOrder as string[]).includes(id)
        ? g.drawOrder
        : ([...g.drawOrder, id] as never),
    });
    mark_local_changed();
    await new Promise((r) => setTimeout(r, 2)); // Date.now() moves on
  });
};

const server = () => fs.docs.get("ba1") as { itemStore: { [k: string]: { text: string } }; drawOrder: string[]; last_updated: number };

const open_ba1 = async () => {
  render(<Edit ba="ba1" />);
  await flush();
  expect(getGlobal().drawOrder).toEqual(["k1"]);
};

beforeEach(async () => {
  fs.reset();
  reset_sync_version(); // a new page load
  backups.length = 0;
  fs.docs.set("ba1", ba_v1());
  window.location.hash = "edit=ba1";
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
  window.location.hash = "";
  constants.to_make_local_backup = true;
});

describe("save does not overwrite a version saved elsewhere", () => {
  test("a sleeping tab that wakes up does not overwrite an hour of work from another device", async () => {
    // backups of every save off (user script): the backup asserted below must
    // come from the conflict path, not from the ordinary save
    constants.to_make_local_backup = false;
    await open_ba1();
    fs.asleep = true; // the laptop lid is closed
    await other_device_saves(T0 + 30 * 60 * 1000);
    // the laptop wakes up and the first edit happens before the listener
    // catches up; its clock (Date.now()) is later than the iPad's save
    await edit("k1", "moved on the laptop");
    await flush();

    expect(Object.keys(server().itemStore).sort()).toEqual(["k1", "k2"]);
    expect(server().itemStore["k1"]!.text).toBe("first");
    expect(server().last_updated).toBe(T0 + 30 * 60 * 1000);
    // the user is told, and the laptop's state is kept locally
    expect(screen.getByTestId("save-conflict")).toHaveTextContent(/updated on another device or tab/);
    expect(getGlobal().itemStore["k1"]).toMatchObject({ text: "moved on the laptop" });
    expect(backups.some((j) => JSON.parse(j).itemStore.k1.text === "moved on the laptop")).toBe(true);

    // later edits are not written either
    await edit("k3", "more on the laptop");
    await flush();
    expect(Object.keys(server().itemStore).sort()).toEqual(["k1", "k2"]);
  });

  test("'Save this as a new Ba' keeps both versions", async () => {
    await open_ba1();
    fs.asleep = true;
    await other_device_saves(T0 + 30 * 60 * 1000);
    await edit("k1", "moved on the laptop");
    await flush();

    await userEvent.click(within(screen.getByTestId("save-conflict")).getByText("Save this as a new Ba"));
    await flush();
    expect(fs.added).toHaveLength(1);
    const copy = fs.docs.get("copy1") as ReturnType<typeof server>;
    expect(copy.itemStore["k1"]!.text).toBe("moved on the laptop");
    expect(Object.keys(server().itemStore).sort()).toEqual(["k1", "k2"]);
    expect(getGlobal().cloud_ba).toBe("copy1");
    expect(screen.queryByTestId("save-conflict")).toBeNull();

    // the copy is this tab's own: an edit is saved into it, even before its
    // first snapshot arrives
    fs.asleep = true;
    await edit("k1", "edited in the copy");
    await flush();
    expect((fs.docs.get("copy1") as ReturnType<typeof server>).itemStore["k1"]!.text).toBe(
      "edited in the copy"
    );
    expect(server().itemStore["k1"]!.text).toBe("first");
  });

  test("a Ba deleted elsewhere is not re-created by a sleeping tab", async () => {
    await open_ba1();
    fs.asleep = true;
    await act(async () => {
      fs.commit("ba1", undefined);
    });
    await edit("k1", "moved on the laptop");
    await flush();
    expect(fs.docs.has("ba1")).toBe(false);
  });

  test("an offline save is retried and reaches the server when the connection is back", async () => {
    // (undefined on a base without retries; the test then fails on the assertion)
    const retry = SAVE_RETRY as { first_ms: number } | undefined;
    if (retry) retry.first_ms = 20;
    await open_ba1();
    fs.fail_next = { code: "unavailable", message: "offline" };
    await edit("k1", "edited offline");
    // the first attempt failed (the fake throws before it commits). Do not
    // look at the server here: the 20 ms retry may already have run when the
    // test is slow (cold start, a loaded machine).
    expect(fs.fail_next).toBeNull();
    // the retry writes it without another edit
    for (let i = 0; i < 100 && server().itemStore["k1"]!.text !== "edited offline"; i++) {
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
    }
    await flush();
    expect(server().itemStore["k1"]!.text).toBe("edited offline");
    expect(getGlobal().statusBar.type).toBe("done");
    if (retry) retry.first_ms = 2000;
  });
});

test("coming back online retries at once", async () => {
  const retry = SAVE_RETRY as { first_ms: number } | undefined;
  if (retry) retry.first_ms = 10 * 60 * 1000;
  await open_ba1();
  fs.fail_next = { code: "unavailable", message: "offline" };
  await edit("k1", "edited offline");
  await flush();
  expect(server().itemStore["k1"]!.text).toBe("first");
  await act(async () => {
    window.dispatchEvent(new Event("online"));
  });
  await flush();
  expect(server().itemStore["k1"]!.text).toBe("edited offline");
  if (retry) retry.first_ms = 2000;
});

describe("the listener does not silently drop unsaved local changes", () => {
  test("a newer snapshot from another device while a local save is in flight", async () => {
    await open_ba1();
    let release = () => {};
    fs.gate = new Promise<void>((r) => (release = r));
    await edit("k3", "written on the laptop"); // save in flight
    // the other device's save (its clock is later) arrives first
    await other_device_saves(Date.now() + 1000);
    await flush();

    // not replaced: the local change is still there, and the user is told
    expect(getGlobal().itemStore["k3"]).toMatchObject({ text: "written on the laptop" });
    expect(screen.getByTestId("save-conflict")).toBeInTheDocument();
    await act(async () => {
      release();
    });
    await flush();
    // and the in-flight save did not overwrite the other device either
    expect(Object.keys(server().itemStore).sort()).toEqual(["k1", "k2"]);
  });

  test("an update from a device whose clock is behind is taken in, and the next save keeps it", async () => {
    await open_ba1();
    // the iPad's clock is 30 s behind: its save has a smaller last_updated
    // than this tab's latest version
    await act(async () => {
      setGlobal({ last_updated: T0 + 40000 });
    });
    await other_device_saves(T0 + 10000);
    await flush();
    expect(getGlobal().drawOrder).toEqual(["k1", "k2"]);

    await edit("k1", "moved on the laptop");
    await flush();
    expect(Object.keys(server().itemStore).sort()).toEqual(["k1", "k2"]);
    expect(server().itemStore["k1"]!.text).toBe("moved on the laptop");
    expect(screen.queryByTestId("save-conflict")).toBeNull();
  });
});

describe("no false conflicts", () => {
  test("consecutive saves of the same tab, both in flight, end with the last edit", async () => {
    await open_ba1();
    let release = () => {};
    fs.gate = new Promise<void>((r) => (release = r));
    await edit("k1", "edit 1");
    await edit("k1", "edit 2");
    await act(async () => {
      release();
    });
    await flush();
    fs.gate = null;
    expect(server().itemStore["k1"]!.text).toBe("edit 2");
    expect(screen.queryByTestId("save-conflict")).toBeNull();
    expect(getGlobal().statusBar.type).toBe("done");

    // and the tab keeps saving normally afterwards
    await edit("k1", "edit 3");
    await flush();
    expect(server().itemStore["k1"]!.text).toBe("edit 3");
  });

  test("an update from another device with nothing unsaved here is followed, then saving continues", async () => {
    await open_ba1();
    await other_device_saves(Date.now() + 1000);
    await flush();
    expect(getGlobal().drawOrder).toEqual(["k1", "k2"]);
    await edit("k1", "after following");
    await flush();
    expect(server().itemStore["k1"]!.text).toBe("after following");
    expect(Object.keys(server().itemStore).sort()).toEqual(["k1", "k2"]);
  });
});
