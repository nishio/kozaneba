import { getGlobal, setGlobal } from "reactn";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";

// minimal fake of the compat Firestore API used by save / subscription
const listeners = new Map<number, string>();
let next_listener = 0;
let set_result: Promise<void> = Promise.resolve();
const fake_db = {
  collection: () => ({
    doc: (ba: string) => ({
      onSnapshot: () => {
        const key = next_listener++;
        listeners.set(key, ba);
        return () => listeners.delete(key);
      },
      set: () => set_result,
    }),
  }),
};
vi.mock("./init_firebase", () => ({ db: fake_db, auth: { currentUser: { uid: "u1" } } }));
vi.mock("./FirestoreIO", () => ({ docdate_to_state: (x: unknown) => x }));
vi.mock("./not_login_then_show_dialog", () => ({ not_login_then_show_dialog: () => false }));
vi.mock("./LocalBackup", () => ({ local_db: { backup: { add: vi.fn() } } }));
vi.mock("../API/KozanebaAPI", () => ({
  kozaneba: { constants: { to_make_local_backup: false } },
}));

const { set_up_read_subscription, stop_current_subscription } = await import(
  "./set_up_read_subscription"
);
const { save } = await import("./save");
const { local_db } = await import("./LocalBackup");

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
  });

  test("a rejected save is shown and backed up locally", async () => {
    set_result = Promise.reject({ code: "invalid-argument", message: "too big" });
    save();
    await new Promise((r) => setTimeout(r, 0));
    expect(getGlobal().statusBar.type).toBe("text");
    expect(getGlobal().save_error).toMatch(/too large/);
    expect(getGlobal().is_local_change).toBe(false);
    expect(local_db.backup.add).toHaveBeenCalled();
  });

  test("a successful save clears the error", async () => {
    setGlobal({ save_error: "Could not save: x" });
    set_result = Promise.resolve();
    save();
    await new Promise((r) => setTimeout(r, 0));
    expect(getGlobal().statusBar.type).toBe("done");
    expect(getGlobal().save_error).toBe("");
  });
});
