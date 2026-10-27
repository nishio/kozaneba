import { getGlobal, setGlobal } from "reactn";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import {
  set_up_read_subscription,
  stop_current_subscription,
} from "./set_up_read_subscription";
import { save } from "./save";
import { local_db } from "./LocalBackup";
import { note_server_version } from "./sync_version";

// minimal fake of the compat Firestore API used by save / subscription
const fake = vi.hoisted(() => {
  const state = {
    listeners: new Map<number, string>(),
    next_listener: 0,
    set_result: Promise.resolve() as Promise<void>,
  };
  const db = {
    collection: () => ({
      doc: (ba: string) => ({
        onSnapshot: () => {
          const key = state.next_listener++;
          state.listeners.set(key, ba);
          return () => state.listeners.delete(key);
        },
        set: () => state.set_result,
      }),
    }),
    // save() writes in a transaction; the server doc is at version 5
    runTransaction: async (
      fn: (t: { get: () => Promise<unknown>; set: () => void }) => Promise<unknown>
    ) => {
      const r = await fn({
        get: async () => ({ exists: true, data: () => ({ last_updated: 5 }) }),
        set: () => {},
      });
      await state.set_result;
      return r;
    },
  };
  return { state, db };
});
vi.mock("./init_firebase", () => ({ db: fake.db, auth: { currentUser: { uid: "u1" } } }));
vi.mock("./FirestoreIO", () => ({ docdate_to_state: (x: unknown) => x }));
vi.mock("./not_login_then_show_dialog", () => ({ not_login_then_show_dialog: () => false }));
vi.mock("./LocalBackup", () => ({ local_db: { backup: { add: vi.fn() } } }));
vi.mock("../API/KozanebaAPI", () => ({
  kozaneba: { constants: { to_make_local_backup: false } },
}));
const listeners = fake.state.listeners;

describe("read subscription", () => {
  beforeEach(() => {
    stop_current_subscription();
    listeners.clear();
  });

  test("keeps a single live listener even if subscribed twice", () => {
    set_up_read_subscription("board1"); // save_new
    set_up_read_subscription("board1"); // Blank's effect
    expect([...listeners.values()]).toEqual(["board1"]);
    // Make Copy stops the current one and the copy is subscribed
    stop_current_subscription();
    set_up_read_subscription("board2");
    set_up_read_subscription("board2");
    expect([...listeners.values()]).toEqual(["board2"]);
  });
});

describe("save", () => {
  beforeEach(() => {
    setGlobal({ ...INITIAL_GLOBAL_STATE, cloud_ba: "ba1", last_updated: 5 });
    note_server_version("ba1", 5);
  });

  test("a rejected save is shown and backed up locally", async () => {
    fake.state.set_result = Promise.reject({ code: "invalid-argument", message: "too big" });
    save();
    await new Promise((r) => setTimeout(r, 0));
    expect(getGlobal().statusBar.type).toBe("text");
    expect(getGlobal().save_error).toMatch(/too large/);
    expect(getGlobal().is_local_change).toBe(false);
    expect(local_db.backup.add).toHaveBeenCalled();
  });

  test("a successful save clears the error", async () => {
    setGlobal({ save_error: "Could not save: x" });
    fake.state.set_result = Promise.resolve();
    save();
    await new Promise((r) => setTimeout(r, 0));
    expect(getGlobal().statusBar.type).toBe("done");
    expect(getGlobal().save_error).toBe("");
  });
});
