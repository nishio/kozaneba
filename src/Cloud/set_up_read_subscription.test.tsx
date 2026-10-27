// A ba document is written by other users. These tests check that opening a
// shared ba only loads the persisted fields of the ba (finding U1).
import { act, cleanup, render } from "@testing-library/react";
import { getGlobal, setGlobal } from "reactn";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Edit } from "../App/Edit";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { set_up_read_subscription } from "./set_up_read_subscription";

// In-memory stand-in for the compat Firestore API that the app uses.
// Every write by the app is accepted, so a test sees what the client tries
// to write, independent of firestore.rules.
const fake = vi.hoisted(() => {
  type Doc = { [key: string]: unknown };
  type Listener = (snap: unknown) => void;
  const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
  const fs = {
    uid: "victim",
    docs: new Map<string, Doc>(),
    listeners: new Map<string, Set<Listener>>(),
    writes: [] as string[],
    callback_errors: [] as string[],
    reset() {
      fs.docs.clear();
      fs.listeners.clear();
      fs.writes = [];
      fs.callback_errors = [];
    },
    deliver(id: string, cb: Listener) {
      const v = fs.docs.get(id);
      const snap = {
        id,
        data: () => (v === undefined ? undefined : clone(v)),
        metadata: { hasPendingWrites: false },
      };
      try {
        cb(snap);
      } catch (e) {
        fs.callback_errors.push(`${id}: ${(e as Error).message}`);
      }
    },
    // A write by someone else, seen by every open subscription.
    server_write(id: string, doc: Doc) {
      fs.docs.set(id, clone(doc));
      for (const cb of fs.listeners.get(id) ?? []) fs.deliver(id, cb);
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
      return () => {
        fs.listeners.get(id)?.delete(cb);
      };
    },
    set(doc: Doc) {
      fs.writes.push(id);
      fs.server_write(id, doc);
      return Promise.resolve();
    },
  });
  const db = {
    collection: (_name: string) => ({
      doc: doc_ref,
      add: () => Promise.reject(new Error("not used")),
    }),
    settings: () => {},
  };
  const auth = {
    get currentUser() {
      return { uid: fs.uid, displayName: fs.uid };
    },
    onAuthStateChanged: () => () => {},
  };
  return { fs, db, auth };
});

vi.mock("./init_firebase", () => ({
  db: fake.db,
  auth: fake.auth,
  GoogleAuthProvider: { PROVIDER_ID: "google.com" },
}));
vi.mock("firebaseui", () => ({
  auth: {
    AuthUI: class {
      start() {}
      reset() {}
    },
  },
}));

const { fs } = fake;

const kozane = (id: string, text: string) => ({
  type: "kozane",
  id,
  text,
  position: [0, 0],
  scale: 1,
});

// A ba the victim owns and shares as view-only.
const victim_ba = () => ({
  version: 3,
  itemStore: { k1: kozane("k1", "victim's note") },
  drawOrder: ["k1"],
  last_updated: 1700000000000,
  anyone_writable: false,
  title: "victim ba",
  writers: ["victim"],
  annotations: [],
  scrapbox: "",
});

// Fields that are client state, not part of a ba. A ba document written by
// an attacker (possible with main's firestore.rules, and such documents stay
// readable after #70) can contain them.
const INJECTED = {
  cloud_ba: "victimBa",
  is_local_change: true,
  show_devmenu: true,
  fix_ba_for_test: "victimBa",
  fix_timestamp_for_test: 123,
  usingFirestoreEmulator: true,
  in_tutorial: true,
  dialog: "CloudSave",
  user: { uid: "attacker" },
};

const attacker_ba = () => ({
  version: 3,
  itemStore: { a1: kozane("a1", "attacker's note") },
  drawOrder: ["a1"],
  last_updated: 1700000005000,
  anyone_writable: true,
  title: "innocent looking ba",
  writers: ["attacker"],
  annotations: [],
  scrapbox: "",
  ...INJECTED,
});

const flush = async () => {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
  }
};

const reset_global = (ba: string) =>
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    show_devmenu: false,
    cloud_ba: ba,
    user: { uid: "victim" } as never,
  });

let stops: (() => void)[] = [];
const subscribe = (ba: string) => {
  stops.push(set_up_read_subscription(ba));
};

beforeEach(async () => {
  fs.reset();
  fs.uid = "victim";
  await reset_global("");
});
afterEach(() => {
  cleanup();
  stops.forEach((stop) => stop());
  stops = [];
});

describe("opening a shared ba (Edit -> subscription -> LocalChangeWatcher)", () => {
  test("a ba doc with client-state fields does not make the victim overwrite their own ba", async () => {
    fs.docs.set("victimBa", victim_ba());
    fs.docs.set("attackerBa", attacker_ba());

    render(<Edit ba="attackerBa" />);
    await flush();

    // On main the injected cloud_ba + is_local_change made the client save
    // the attacker's content into victimBa with writers ["attacker", "victim"].
    expect(fs.writes).toEqual([]);
    expect(fs.docs.get("victimBa")).toEqual(victim_ba());
    const g = getGlobal();
    expect(g.cloud_ba).toBe("attackerBa");
    expect(g.is_local_change).toBe(false);
    // The ba itself is shown.
    expect(g.title).toBe("innocent looking ba");
    expect(Object.keys(g.itemStore)).toEqual(["a1"]);
    expect(fs.callback_errors).toEqual([]);
  });
});

describe("set_up_read_subscription", () => {
  // fit_to_contents, which runs after a snapshot is applied, measures the
  // app bar. Edit renders one; these tests call the subscription directly.
  let appbar: HTMLElement;
  beforeEach(() => {
    appbar = document.createElement("div");
    appbar.id = "appbar";
    document.body.appendChild(appbar);
  });
  afterEach(() => {
    appbar.remove();
  });

  test("ignores every field of the doc that is not a persisted ba field", async () => {
    fs.docs.set("attackerBa", attacker_ba());
    await reset_global("attackerBa");
    const before = getGlobal();
    subscribe("attackerBa");
    await flush();

    const g = getGlobal();
    expect(g.title).toBe("innocent looking ba"); // the snapshot was applied
    expect(g.cloud_ba).toBe("attackerBa");
    expect(g.is_local_change).toBe(false);
    expect(g.show_devmenu).toBe(false);
    expect(g.fix_ba_for_test).toBe("");
    expect(g.fix_timestamp_for_test).toBe(null);
    expect(g.usingFirestoreEmulator).toBe(before.usingFirestoreEmulator);
    expect(g.in_tutorial).toBe(false);
    expect(g.dialog).toBe(before.dialog);
    expect(g.user).toEqual({ uid: "victim" });
    expect("version" in g).toBe(false);
  });

  test("loads all persisted fields of a legitimate ba", async () => {
    const annotation = {
      type: "line",
      items: ["k1", "g1"],
      heads: ["none", "arrow"],
      is_doubled: false,
      label: "because",
      custom: {},
    };
    fs.docs.set("ba1", {
      version: 3,
      itemStore: {
        k1: kozane("k1", "hello"),
        p1: { ...kozane("p1", "old piece"), type: "piece" },
        g1: {
          type: "group",
          id: "g1",
          title: "old group title",
          position: [10, 10],
          items: ["p1"],
          isOpen: true,
        },
      },
      drawOrder: ["k1", "g1"],
      last_updated: 1700000000000,
      anyone_writable: false,
      title: "my ba",
      writers: ["owner", "victim"],
      annotations: [annotation],
      scrapbox: "nishio",
    });
    await reset_global("ba1");
    subscribe("ba1");
    await flush();

    const g = getGlobal();
    expect(g.drawOrder).toEqual(["k1", "g1"]);
    expect(g.itemStore.k1).toEqual(kozane("k1", "hello"));
    expect(g.itemStore.p1?.type).toBe("kozane"); // upgrade() still runs
    expect(g.itemStore.g1?.text).toBe("old group title");
    expect(g.last_updated).toBe(1700000000000);
    expect(g.anyone_writable).toBe(false);
    expect(g.title).toBe("my ba");
    expect(g.writers).toEqual(["owner", "victim"]);
    expect(g.annotations).toEqual([annotation]);
    expect(g.scrapbox).toBe("nishio");
    expect(fs.callback_errors).toEqual([]);
  });

  test("drops persisted fields that have a wrong type", async () => {
    fs.docs.set("ba1", {
      ...victim_ba(),
      title: { toString: "x" },
      writers: "attacker",
      anyone_writable: "yes",
      scrapbox: 1,
      drawOrder: "k1",
    });
    await reset_global("ba1");
    subscribe("ba1");
    await flush();

    const g = getGlobal();
    expect(Object.keys(g.itemStore)).toEqual(["k1"]); // the snapshot was applied
    expect(g.title).toBe("");
    expect(g.writers).toEqual([]);
    expect(g.anyone_writable).toBe(true);
    expect(g.scrapbox).toBe("");
    expect(g.drawOrder).toEqual([]);
  });

  test("ignores a snapshot of a ba the client no longer shows", async () => {
    fs.docs.set("baA", { ...victim_ba(), title: "A" });
    await reset_global("baA");
    subscribe("baA");
    await flush();
    expect(getGlobal().title).toBe("A");

    // The client moved to baB but the baA subscription is still alive
    // (save_new subscribes without stopping the previous one).
    setGlobal({ cloud_ba: "baB", title: "B" });
    fs.server_write("baA", {
      ...victim_ba(),
      title: "A edited",
      last_updated: 1700000009000,
    });
    await flush();

    expect(getGlobal().cloud_ba).toBe("baB");
    expect(getGlobal().title).toBe("B");
  });

  test("a last_updated far in the future does not stop later updates", async () => {
    fs.docs.set("ba1", { ...victim_ba(), title: "planted", last_updated: 9e15 });
    await reset_global("ba1");
    subscribe("ba1");
    await flush();
    expect(getGlobal().title).toBe("planted");
    expect(getGlobal().last_updated).toBeLessThanOrEqual(Date.now());

    // An ordinary edit by another writer, a moment later.
    fs.server_write("ba1", {
      ...victim_ba(),
      title: "edited later",
      last_updated: Date.now() + 1000,
    });
    await flush();

    expect(getGlobal().title).toBe("edited later");
    expect(fs.callback_errors).toEqual([]);
  });

  test("keeps a last_updated that is only slightly ahead (clock skew)", async () => {
    const skewed = Date.now() + 60 * 60 * 1000;
    fs.docs.set("ba1", { ...victim_ba(), last_updated: skewed });
    await reset_global("ba1");
    subscribe("ba1");
    await flush();
    expect(getGlobal().last_updated).toBe(skewed);
  });
});
