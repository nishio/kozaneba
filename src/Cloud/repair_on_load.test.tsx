// Every path that puts a Ba from outside into the global state repairs a
// broken nest (repair_nest): a Firestore snapshot, a local backup, the local
// draft, and pasted Kozaneba JSON (v3 / v4).
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { expectWellFormed } from "../utils/expect_well_formed";
import { LocalDraftKeeper } from "../App/LocalDraftKeeper";
import { try_to_import_json } from "../utils/JSON/try_to_import_json";
import { read_doc } from "./FirestoreIO";
import { restore_backup } from "./restore_backup";
import { set_up_read_subscription } from "./set_up_read_subscription";

const fake = vi.hoisted(() => {
  const state = {
    listener: null as null | ((snap: unknown) => void),
    backup: null as null | object,
  };
  const db = {
    collection: () => ({
      doc: () => ({
        onSnapshot: (cb: (snap: unknown) => void) => {
          state.listener = cb;
          return () => {};
        },
      }),
    }),
  };
  const auth = { currentUser: null, onAuthStateChanged: () => () => {} };
  const sentry = { captureMessage: vi.fn() };
  return { state, db, auth, sentry };
});
vi.mock("./init_firebase", () => ({ db: fake.db, auth: fake.auth }));
vi.mock("firebaseui", () => ({
  auth: { AuthUI: class { start() {} reset() {} } },
}));
vi.mock("../initSentry", () => ({ Sentry: fake.sentry }));
vi.mock("../utils/fit_to_contents", () => ({ fit_to_contents: () => ({}) }));
vi.mock("./backup_store", () => ({
  get_backup_doc: async () => fake.state.backup,
  add_backup: async () => {},
  backup_if_enabled: () => {},
}));

const kozane = (id: string) => ({
  type: "kozane",
  id,
  text: `text of ${id}`,
  position: [0, 0],
  scale: 1,
});
const group = (id: string, items: string[]) => ({
  type: "group",
  id,
  text: "",
  position: [0, 0],
  items,
  scale: 1,
  isOpen: true,
});

// A saved Ba with the orphan of #135 (k0, with a line to it) and a cycle that
// drawOrder does not reach (c1 <-> c2).
const broken_doc = (last_updated: number) => ({
  version: 3,
  itemStore: {
    k0: kozane("k0"),
    k1: kozane("k1"),
    k2: kozane("k2"),
    G: group("G", ["k1", "k2"]),
    c1: group("c1", ["c2"]),
    c2: group("c2", ["c1"]),
  },
  drawOrder: ["G"],
  annotations: [
    {
      type: "line",
      items: ["k0", "k1"],
      heads: ["none", "arrow"],
      is_doubled: false,
      custom: {},
    },
  ],
  last_updated,
  writers: ["owner"],
  anyone_writable: true,
  title: "",
});

const expect_repaired = (g: State) => {
  expectWellFormed(g);
  expect(g.itemStore["k0"]).toBeUndefined();
  expect(g.drawOrder).toEqual(["G", "c1"]);
  expect(g.annotations).toEqual([]);
};

// what this tab had: the orphan was still shown and selected here before
// another client turned it into an orphan
const local_state = (extra: Partial<State> = {}) =>
  ({
    ...INITIAL_GLOBAL_STATE,
    language: "en",
    itemStore: { k0: kozane("k0") },
    drawOrder: ["k0"],
    selected_items: ["k0"],
    is_selected: true,
    selectionRange: { top: 1, left: 2, width: 3, height: 4 },
    clicked_target: "k0",
    menu: "kozane",
    line_start: "k0",
    last_updated: 100,
    ...extra,
  }) as unknown as State;

const expect_no_stale_ids = (g: State) => {
  expect(g.selected_items).toEqual([]);
  expect(g.is_selected).toBe(false);
  expect(g.clicked_target).toBe("");
  expect(g.menu).toBe("");
  expect(g.line_start).toBe("");
};

beforeEach(async () => {
  fake.sentry.captureMessage.mockClear();
  await act(async () => {
    setGlobal({ ...INITIAL_GLOBAL_STATE, language: "en" });
  });
});
afterEach(() => {
  cleanup();
});

describe("a doc from Firestore", () => {
  // read_doc only returns the counts: the snapshots that are not adopted
  // are parsed too, and those are not reported (review of #139)
  test("read_doc repairs it and returns the counts, without sending them", () => {
    const { state, nest_report } = read_doc(broken_doc(100) as never);
    expect_repaired(state as State);
    expect(nest_report).toMatchObject({ orphans: 1, cycles: 1 });
    expect(fake.sentry.captureMessage).not.toHaveBeenCalled();
  });

  test("read_doc returns no counts for a well-formed doc", () => {
    const doc = broken_doc(100);
    doc.itemStore = { k1: kozane("k1"), k2: kozane("k2"), G: group("G", ["k1", "k2"]) } as never;
    doc.annotations = [];
    expect(read_doc(doc as never).nest_report).toBeNull();
  });

  test("a doc whose drawOrder has a wrong type keeps its items (not deleted as orphans)", () => {
    const doc = { ...broken_doc(100), drawOrder: "G" };
    const { state, nest_report } = read_doc(doc as never);
    const s = state as State;
    expect(s.drawOrder).toEqual([]);
    expect(Object.keys(s.itemStore).sort()).toEqual(["G", "c1", "c2", "k0", "k1", "k2"]);
    expect(nest_report).toBeNull();
  });

  test("a snapshot from elsewhere is repaired, not saved, and stale ids are forgotten", () => {
    setGlobal(local_state({ cloud_ba: "ba1" }));
    set_up_read_subscription("ba1");
    fake.state.listener!({
      data: () => broken_doc(200),
      metadata: { hasPendingWrites: false },
    });
    const g = getGlobal();
    expect_repaired(g);
    expect_no_stale_ids(g);
    // not marked as a local change: the repair is saved with the next edit
    expect(g.is_local_change).toBe(false);
    expect(g.last_updated).toBe(200);
    expect(fake.sentry.captureMessage).toHaveBeenCalledTimes(1);
    expect(fake.sentry.captureMessage.mock.calls[0]![1].extra).toMatchObject({
      where: "snapshot",
      orphans: 1,
      cycles: 1,
    });

    // the same version again (not adopted), then a newer broken version of
    // the same ba (adopted): reported once per ba in a page session
    fake.state.listener!({
      data: () => broken_doc(200),
      metadata: { hasPendingWrites: false },
    });
    fake.state.listener!({
      data: () => broken_doc(300),
      metadata: { hasPendingWrites: false },
    });
    expect(getGlobal().last_updated).toBe(300);
    expect(fake.sentry.captureMessage).toHaveBeenCalledTimes(1);
  });

  test("a broken snapshot that is not adopted is not reported", () => {
    // this tab already has the version (e.g. the ack of its own save)
    setGlobal(local_state({ cloud_ba: "ba2", last_updated: 200 }));
    set_up_read_subscription("ba2");
    fake.state.listener!({
      data: () => broken_doc(200),
      metadata: { hasPendingWrites: false },
    });
    expect(getGlobal().drawOrder).toEqual(["k0"]);
    expect(fake.sentry.captureMessage).not.toHaveBeenCalled();
  });

  // The selection holds top-level items only: an item that still exists but
  // that another client moved into a group leaves the selection too.
  test("a selected item moved into a group elsewhere leaves the selection; a gone drag target is dropped", () => {
    setGlobal(
      local_state({
        cloud_ba: "ba3",
        itemStore: { k1: kozane("k1"), k2: kozane("k2"), k9: kozane("k9") } as never,
        drawOrder: ["k1", "k2", "k9"],
        selected_items: ["k1"],
        clicked_target: "k2",
        menu: "Kozane",
        line_start: "",
        drag_target: "k9",
      } as unknown as Partial<State>)
    );
    set_up_read_subscription("ba3");
    const doc = broken_doc(200);
    doc.itemStore = { k1: kozane("k1"), k2: kozane("k2"), G: group("G", ["k1"]) } as never;
    doc.drawOrder = ["G", "k2"];
    doc.annotations = [];
    fake.state.listener!({ data: () => doc, metadata: { hasPendingWrites: false } });
    const g = getGlobal();
    expectWellFormed(g);
    expect(g.selected_items).toEqual([]);
    expect(g.is_selected).toBe(false);
    expect(g.drag_target).toBe("");
    // k2 is still there: its menu stays open
    expect(g.clicked_target).toBe("k2");
    expect(g.menu).toBe("Kozane");
    expect(fake.sentry.captureMessage).not.toHaveBeenCalled();
  });
});

describe("a local backup", () => {
  test("restore_backup repairs it and forgets stale ids", async () => {
    setGlobal(local_state({ cloud_ba: "ba1" }));
    fake.state.backup = broken_doc(50);
    await act(async () => {
      expect(await restore_backup(1)).toBe(true);
    });
    const g = getGlobal();
    expect_repaired(g);
    expect_no_stale_ids(g);
    expect(fake.sentry.captureMessage.mock.calls[0]![1].extra).toMatchObject({
      where: "backup",
      orphans: 1,
    });
  });
});

describe("the local draft", () => {
  test("Restore repairs it", async () => {
    window.location.hash = "";
    window.localStorage.setItem(
      "kozaneba_local_draft",
      JSON.stringify({ saved_at: 1700000000000, doc: broken_doc(50) })
    );
    await act(async () => {
      setGlobal(local_state());
    });
    render(<LocalDraftKeeper />);
    await userEvent.click(screen.getByRole("button", { name: "Restore" }));
    const g = getGlobal();
    expect_repaired(g);
    expect_no_stale_ids(g);
    expect(fake.sentry.captureMessage.mock.calls[0]![1].extra).toMatchObject({
      where: "draft",
      orphans: 1,
    });
    window.localStorage.clear();
  });
});

describe("pasted Kozaneba JSON", () => {
  // A cycle that drawOrder reaches made the import recurse until the stack
  // overflowed; try_to_import_json then took the JSON as not JSON.
  test("v4 with a cycle and a duplicate is imported well-formed", () => {
    const json = JSON.stringify({
      format: "Kozaneba",
      version: 4,
      drawOrder: ["A", "k1", "x"],
      itemStore: {
        A: group("A", ["B", "k1"]),
        B: group("B", ["A"]),
        k1: kozane("k1"),
        k0: kozane("k0"),
      },
      annotation: [
        {
          type: "line",
          items: ["k0", "k1"],
          heads: ["none", "arrow"],
          is_doubled: false,
          custom: {},
        },
      ],
    });
    expect(try_to_import_json(json)).toBe(true);
    const g = getGlobal();
    expectWellFormed(g);
    expect(g.drawOrder.length).toBe(1);
    expect(Object.keys(g.itemStore).length).toBe(4); // new group, A, B, k1
    expect(g.annotations).toEqual([]);
    expect(fake.sentry.captureMessage.mock.calls[0]![1].extra).toMatchObject({
      where: "json",
    });
  });

  // repair_nest runs before the items and lines are checked; garbage must
  // still get the "not valid" alert (review of #139)
  test("v4 with a null item or a null line is still rejected with the alert", () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    const with_null_item = JSON.stringify({
      format: "Kozaneba",
      version: 4,
      drawOrder: ["k1", "n"],
      itemStore: { k1: kozane("k1"), n: null },
      annotation: [],
    });
    expect(try_to_import_json(with_null_item)).toBe(false);
    const with_null_line = JSON.stringify({
      format: "Kozaneba",
      version: 4,
      drawOrder: ["k1"],
      itemStore: { k1: kozane("k1"), k0: kozane("k0") },
      annotation: [null],
    });
    expect(try_to_import_json(with_null_line)).toBe(false);
    expect(alert).toHaveBeenCalledTimes(2);
    alert.mockRestore();
  });

  test("v3 with a cycle is imported well-formed", () => {
    const json = JSON.stringify({
      format: "Kozaneba",
      version: 3,
      drawOrder: ["A"],
      itemStore: { A: group("A", ["B"]), B: group("B", ["A", "k1"]), k1: kozane("k1") },
    });
    expect(try_to_import_json(json)).toBe(true);
    const g = getGlobal();
    expectWellFormed(g);
    expect(Object.keys(g.itemStore).length).toBe(4);
  });
});
