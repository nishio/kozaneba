import { fireEvent, render, screen, within } from "@testing-library/react";
import { getGlobal, setGlobal } from "reactn";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TUser } from "../Cloud/init_firebase";
import { BaDialog } from "./BaDialog";

// BaDialog pulls in Firebase through these; the Share section does not use them
vi.mock("../Cloud/init_firebase", () => ({ db: {}, auth: {} }));
vi.mock("../utils/make_copy", () => ({ make_copy: vi.fn() }));
vi.mock("../Cloud/delete_ba", () => ({ delete_ba: vi.fn() }));

const open_dialog = (uid: string, writers: string[], anyone_writable = true) => {
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    dialog: "Ba",
    cloud_ba: "ba1",
    user: { uid } as unknown as TUser,
    writers,
    anyone_writable,
  });
  render(<BaDialog />);
  return screen.getByTestId("ba-dialog");
};

// firestore.rules lets only writers[0] change anyone_writable. A selector
// shown to anyone else leads to a rejected save, and since every later save
// resends the whole doc with the changed value, all later edits are rejected
// too (until reload).
describe("Share edit/view selector", () => {
  test("the owner (writers[0]) can switch edit -> view", async () => {
    const dialog = open_dialog("owner", ["owner", "other"]);
    fireEvent.mouseDown(within(dialog).getByRole("combobox"));
    fireEvent.click(await screen.findByRole("option", { name: "view" }));
    expect(getGlobal().anyone_writable).toBe(false);
    expect(getGlobal().is_local_change).toBe(true);
  });

  test("a non-owner writer sees the mode but no selector", () => {
    const dialog = open_dialog("other", ["owner", "other"]);
    expect(within(dialog).queryByRole("combobox")).toBeNull();
    expect(within(dialog).getByText(/Anyone with the link can/)).toHaveTextContent(
      "Anyone with the link can edit"
    );
    expect(within(dialog).getByText(/only the creator/)).toBeInTheDocument();
    // the share URL is still offered
    expect(within(dialog).getByDisplayValue(/#edit=ba1$/)).toBeInTheDocument();
  });

  test("a signed-in visitor of a public ba (not yet a writer) gets no selector", () => {
    const dialog = open_dialog("visitor", ["owner"]);
    expect(within(dialog).queryByRole("combobox")).toBeNull();
  });

  test("nobody gets the selector on an ownerless ba (writers: [])", () => {
    const dialog = open_dialog("visitor", []);
    expect(within(dialog).queryByRole("combobox")).toBeNull();
  });

  test("a non-owner writer of a view-only ba sees 'view' without a selector", () => {
    const dialog = open_dialog("other", ["owner", "other"], false);
    expect(within(dialog).queryByRole("combobox")).toBeNull();
    expect(within(dialog).getByTestId("share-mode")).toHaveTextContent("view");
  });
});
