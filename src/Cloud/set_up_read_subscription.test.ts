import { getGlobal, setGlobal } from "reactn";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TUser } from "./init_firebase";
import { set_up_read_subscription } from "./set_up_read_subscription";

// Captures the snapshot listener so the test can deliver server data.
const fake = vi.hoisted(() => {
  const state = { listener: null as null | ((snap: unknown) => void) };
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
  return { state, db };
});
vi.mock("./init_firebase", () => ({ db: fake.db, auth: {} }));
vi.mock("./FirestoreIO", () => ({
  docdate_to_state: (data: Record<string, unknown>) => ({ ...data }),
}));
vi.mock("../utils/fit_to_contents", () => ({ fit_to_contents: () => ({}) }));

const deliver = (data: Record<string, unknown>) => {
  try {
    fake.state.listener!({ data: () => ({ itemStore: {}, drawOrder: [], ...data }) });
  } catch (e) {
    // the "received old data" warning; local items are kept
  }
};

const open = (uid: string, writers: string[], anyone_writable: boolean) => {
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    cloud_ba: "ba1",
    user: { uid } as unknown as TUser,
    writers,
    anyone_writable,
    last_updated: 100,
  });
  set_up_read_subscription("ba1");
};

// Saves resend the whole doc and firestore.rules rejects one that drops a
// writer or (from a non-owner) changes anyone_writable. When the server data
// is not newer than the local data, local items are kept, but writers and a
// non-owner's anyone_writable must still follow the server, or every later
// save is rejected until reload.
describe("permissions from a snapshot that is not newer", () => {
  test("the owner picks up a writer who joined with an older last_updated", () => {
    open("owner", ["owner"], true);
    deliver({ last_updated: 98, writers: ["owner", "joiner"], anyone_writable: true });
    expect(getGlobal().writers).toEqual(["owner", "joiner"]);
  });

  test("the owner picks up a writer from a snapshot with the same last_updated", () => {
    open("owner", ["owner"], true);
    deliver({ last_updated: 100, writers: ["owner", "joiner"], anyone_writable: true });
    expect(getGlobal().writers).toEqual(["owner", "joiner"]);
  });

  test("a non-owner picks up the owner's change of anyone_writable", () => {
    open("other", ["owner", "other"], true);
    deliver({ last_updated: 98, writers: ["owner", "other"], anyone_writable: false });
    expect(getGlobal().anyone_writable).toBe(false);
  });

  test("the owner's own unsaved share change is not reverted", () => {
    open("owner", ["owner", "other"], false);
    // the change is not on the server yet (optimistic lock: a version from
    // elsewhere while there are unsaved changes is a conflict, not followed)
    setGlobal({ is_local_change: true });
    deliver({ last_updated: 98, writers: ["owner", "other"], anyone_writable: true });
    expect(getGlobal().anyone_writable).toBe(false);
  });

  test("newer server data still replaces local state", () => {
    open("owner", ["owner"], true);
    deliver({ last_updated: 120, writers: ["owner", "joiner"], anyone_writable: true, title: "new" });
    expect(getGlobal().writers).toEqual(["owner", "joiner"]);
    expect(getGlobal().title).toBe("new");
  });
});
