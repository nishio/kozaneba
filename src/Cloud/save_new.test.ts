import { getGlobal, setGlobal } from "reactn";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TUser } from "./init_firebase";
import { make_copy } from "../utils/make_copy";
import { initial_save } from "./initial_save";
import { save } from "./save";
import { is_ba_owner } from "../utils/can_write";

// A fake Firestore that records what the client writes. Snapshots are never
// delivered here, which is the situation of the real first snapshot after
// save_new: it has the same last_updated, so the subscription leaves local
// state alone.
const fake = vi.hoisted(() => {
  const added: Record<string, unknown>[] = [];
  const set: { id: string; doc: Record<string, unknown> }[] = [];
  const db = {
    collection: () => ({
      add: (doc: Record<string, unknown>) => {
        added.push(doc);
        return Promise.resolve({ id: "copy1" });
      },
      doc: (id: string) => ({
        id,
        set: (doc: Record<string, unknown>) => {
          set.push({ id, doc });
          return Promise.resolve();
        },
      }),
    }),
  };
  return { added, set, db, auth: { currentUser: { uid: "me" } } };
});
vi.mock("./init_firebase", () => ({ db: fake.db, auth: fake.auth }));
vi.mock("./set_up_read_subscription", () => ({
  set_up_read_subscription: vi.fn(),
  stop_current_subscription: vi.fn(),
}));
vi.mock("./LocalBackup", () => ({ local_db: {} }));
vi.mock("../API/KozanebaAPI", () => ({
  kozaneba: { constants: { to_make_local_backup: false } },
}));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  fake.added.length = 0;
  fake.set.length = 0;
  window.location.hash = "";
});

// firestore.rules: on update, writers may only grow by the requesting user
// and writers[0] never changes. The doc written by save_new and the next
// whole-doc save must therefore agree on writers.
describe("local state after save_new", () => {
  test("after Make Copy of someone else's ba, the next save sends writers [me] and the copy's title", async () => {
    setGlobal({
      ...INITIAL_GLOBAL_STATE,
      cloud_ba: "orig",
      user: { uid: "me" } as unknown as TUser,
      title: "orig title",
      writers: ["alice", "bob"],
      anyone_writable: true,
    });
    make_copy();
    await flush();
    expect(fake.added).toHaveLength(1);
    expect(fake.added[0]?.writers).toEqual(["me"]);
    expect(getGlobal().cloud_ba).toBe("copy1");

    // the copier owns the copy and gets the Share selector
    expect(is_ba_owner()).toBe(true);

    save();
    await flush();
    expect(fake.set).toHaveLength(1);
    expect(fake.set[0]?.id).toBe("copy1");
    expect(fake.set[0]?.doc.writers).toEqual(["me"]);
    expect(fake.set[0]?.doc.title).toBe("orig title (copy)");
  });

  test("right after Cloud Save of a new ba, the creator is the owner", async () => {
    setGlobal({
      ...INITIAL_GLOBAL_STATE,
      cloud_ba: "",
      user: { uid: "me" } as unknown as TUser,
      writers: [],
    });
    initial_save();
    await flush();
    expect(fake.added[0]?.writers).toEqual(["me"]);
    expect(getGlobal().writers).toEqual(["me"]);
    expect(is_ba_owner()).toBe(true);
  });
});
