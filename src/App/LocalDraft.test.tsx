// D2: a Ba that is not saved to the cloud (before sign-in / Cloud Save) used
// to be lost on reload, closing the tab, or a discarded background tab.
// These tests render the real Blank (as the top page does) and look at what
// reaches localStorage and what the page does on beforeunload.
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getGlobal, setGlobal } from "reactn";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Blank } from "./Blank";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";

const fake = vi.hoisted(() => {
  const db = {
    collection: () => ({
      doc: () => ({
        onSnapshot: () => () => {},
        set: () => new Promise(() => {}), // never acknowledged
      }),
    }),
    settings: () => {},
  };
  const auth = { currentUser: null, onAuthStateChanged: () => () => {} };
  return { db, auth };
});
vi.mock("../Cloud/init_firebase", () => ({
  db: fake.db,
  auth: fake.auth,
  GoogleAuthProvider: { PROVIDER_ID: "google.com" },
}));
vi.mock("firebaseui", () => ({
  auth: { AuthUI: class { start() {} reset() {} } },
}));

const DRAFT_KEY = "kozaneba_local_draft";

const kozane = (id: string, text: string) => ({
  type: "kozane" as const,
  id,
  text,
  position: [0, 0] as [number, number],
  scale: 1,
});

const flush = async () => {
  for (let i = 0; i < 3; i++) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
  }
};

// state preparation: a local Ba with two kozane, as after some work
const work_on_local_ba = async () => {
  await act(async () => {
    setGlobal({
      itemStore: { k1: kozane("k1", "first idea"), k2: kozane("k2", "second idea") },
      drawOrder: ["k1", "k2"],
      last_updated: 1700000000000,
    });
  });
};

const fire = (type: string, target: EventTarget = window) => {
  const e = new Event(type, { cancelable: true });
  target.dispatchEvent(e);
  return e;
};

// A reload: the page goes away (pagehide), the next page starts with the
// initial state and renders the top page again.
const reload = async () => {
  await act(async () => {
    fire("pagehide");
  });
  cleanup();
  await act(async () => {
    setGlobal({ ...INITIAL_GLOBAL_STATE, language: "en" });
  });
  render(<Blank />);
  await flush();
};

beforeEach(async () => {
  window.localStorage.clear();
  window.location.hash = "";
  await act(async () => {
    setGlobal({ ...INITIAL_GLOBAL_STATE, language: "en" });
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("local Ba draft", () => {
  test("a local Ba survives a reload and can be restored", async () => {
    render(<Blank />);
    await work_on_local_ba();
    await reload();

    expect(Object.keys(getGlobal().itemStore)).toEqual([]);
    expect(screen.getByText(/not saved to the cloud \(2 items/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Restore" }));

    const g = getGlobal();
    expect(g.drawOrder).toEqual(["k1", "k2"]);
    expect(g.itemStore["k1"]).toMatchObject({ text: "first idea" });
    expect(g.cloud_ba).toBe("");
    expect(screen.queryByTestId("local-draft-offer")).toBeNull();
  });

  test("Restore closes the tutorial that the top page opens", async () => {
    render(<Blank />);
    await work_on_local_ba();
    await reload();
    await act(async () => {
      setGlobal({ dialog: "Tutorial", in_tutorial: true, tutorial_page: 0 });
    });
    // The tutorial dialog is modal and marks the rest of the page
    // aria-hidden, so look the button up including hidden ones. (Whether the
    // button is reachable by a pointer above the modal is a real-browser
    // question; see the Cypress spec local_draft.cy.ts.)
    await userEvent.click(screen.getByRole("button", { name: "Restore", hidden: true }));
    expect(getGlobal().dialog).toBe("");
    expect(getGlobal().in_tutorial).toBe(false);
    expect(getGlobal().drawOrder).toEqual(["k1", "k2"]);
  });

  test("the draft is written periodically, without pagehide", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    render(<Blank />);
    await work_on_local_ba();
    expect(window.localStorage.getItem(DRAFT_KEY)).toBeNull();
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    const draft = JSON.parse(window.localStorage.getItem(DRAFT_KEY)!);
    expect(draft.doc.drawOrder).toEqual(["k1", "k2"]);
    expect(draft.doc.itemStore.k2.text).toBe("second idea");
  });

  test("the draft is written when the tab goes to the background", async () => {
    render(<Blank />);
    await work_on_local_ba();
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    await act(async () => {
      fire("visibilitychange", document);
    });
    spy.mockRestore();
    const draft = JSON.parse(window.localStorage.getItem(DRAFT_KEY)!);
    expect(draft.doc.drawOrder).toEqual(["k1", "k2"]);
  });

  test("an unanswered offer keeps the old draft; Discard removes it", async () => {
    render(<Blank />);
    await work_on_local_ba();
    await reload();
    // the new canvas (e.g. after the tutorial) must not replace the old draft
    // while the user has not answered
    await act(async () => {
      setGlobal({ itemStore: { n1: kozane("n1", "new") }, drawOrder: ["n1"] });
    });
    await act(async () => {
      fire("pagehide");
    });
    expect(JSON.parse(window.localStorage.getItem(DRAFT_KEY)!).doc.drawOrder).toEqual(["k1", "k2"]);

    await userEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(window.localStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(getGlobal().drawOrder).toEqual(["n1"]);
  });

  test("once the Ba is saved to the cloud, the draft is removed", async () => {
    render(<Blank />);
    await work_on_local_ba();
    await act(async () => {
      fire("pagehide");
    });
    expect(window.localStorage.getItem(DRAFT_KEY)).not.toBeNull();
    await act(async () => {
      setGlobal({ cloud_ba: "ba1" });
    });
    await act(async () => {
      fire("pagehide");
    });
    expect(window.localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  test("the draft is written again after another tab removed it", async () => {
    render(<Blank />);
    await work_on_local_ba();
    await act(async () => {
      fire("pagehide");
    });
    window.localStorage.removeItem(DRAFT_KEY); // e.g. Discard in another tab
    await act(async () => {
      fire("pagehide");
    });
    expect(JSON.parse(window.localStorage.getItem(DRAFT_KEY)!).doc.drawOrder).toEqual(["k1", "k2"]);
  });

  test("the offer is not shown when a cloud Ba is opened", async () => {
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ saved_at: 1, doc: { itemStore: { k1: kozane("k1", "x") }, drawOrder: ["k1"] } })
    );
    window.location.hash = "edit=ba1";
    render(<Blank />);
    await flush();
    expect(screen.queryByTestId("local-draft-offer")).toBeNull();
    window.location.hash = "";
  });
});

describe("beforeunload", () => {
  test("asks before closing a local Ba with items", async () => {
    render(<Blank />);
    await work_on_local_ba();
    expect(fire("beforeunload").defaultPrevented).toBe(true);
    // and the draft is written right then
    expect(JSON.parse(window.localStorage.getItem(DRAFT_KEY)!).doc.drawOrder).toEqual(["k1", "k2"]);
  });

  test("does not ask for an empty local Ba", async () => {
    render(<Blank />);
    await flush();
    expect(fire("beforeunload").defaultPrevented).toBe(false);
  });

  test("asks while a cloud save is not acknowledged, not after it is done", async () => {
    await act(async () => {
      setGlobal({ cloud_ba: "ba1", statusBar: { type: "uploading", text: "" } });
    });
    render(<Blank />);
    await flush();
    expect(fire("beforeunload").defaultPrevented).toBe(true);
    await act(async () => {
      setGlobal({ statusBar: { type: "done", text: "" } });
    });
    expect(fire("beforeunload").defaultPrevented).toBe(false);
  });

  test("asks after a failed cloud save", async () => {
    await act(async () => {
      setGlobal({ cloud_ba: "ba1", statusBar: { type: "text", text: "not saved" }, save_error: "Could not save: x" });
    });
    render(<Blank />);
    await flush();
    expect(fire("beforeunload").defaultPrevented).toBe(true);
  });
});
