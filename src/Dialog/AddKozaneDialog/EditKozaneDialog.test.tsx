import { fireEvent, render, screen } from "@testing-library/react";
import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../../Global/initializeGlobalState";
import { TItemId } from "../../Global/TItemId";
import { TWorldCoord } from "../../dimension/world_to_screen";
import { EditKozaneDialog } from "./EditKozaneDialog";

vi.mock("../../API/redraw", () => ({ redraw: vi.fn() }));
// hotKey reaches Firebase through its imports; only finishButtons is used here
vi.mock("../../App/hotKey", () => ({ finishButtons: {} }));

const id = (value: string) => value as TItemId;

// Editing a kozane into several lines replaces it with a group and deletes it.
// The dialog reads clicked_target on every render, so it must not throw when
// that id is gone (or cleared) while dialog is still "EditKozane".
describe("EditKozaneDialog", () => {
  test("renders nothing instead of throwing when the target is not in itemStore", () => {
    setGlobal({
      ...INITIAL_GLOBAL_STATE,
      dialog: "EditKozane",
      clicked_target: id("gone"),
    } as State);
    expect(() => render(<EditKozaneDialog />)).not.toThrow();
    expect(screen.queryByTestId("edit-kozane-dialog")).toBeNull();
  });

  test("renders nothing when clicked_target is empty", () => {
    setGlobal({ ...INITIAL_GLOBAL_STATE, dialog: "EditKozane", clicked_target: "" } as State);
    expect(() => render(<EditKozaneDialog />)).not.toThrow();
    expect(screen.queryByTestId("edit-kozane-dialog")).toBeNull();
  });

  test("editing into two lines closes the dialog and leaves no orphan", () => {
    setGlobal({
      ...INITIAL_GLOBAL_STATE,
      dialog: "EditKozane",
      drawOrder: [id("A")],
      itemStore: {
        A: { type: "kozane", id: id("A"), text: "A", position: [0, 0] as TWorldCoord, scale: 1 },
      },
      clicked_target: id("A"),
    } as State);
    render(<EditKozaneDialog />);
    fireEvent.change(screen.getByTestId("textarea"), { target: { value: "x\ny" } });
    fireEvent.click(screen.getByTestId("edit-kozane-button"));

    const g = getGlobal();
    expect(g.dialog).toBe("");
    expect(g.itemStore["A"]).toBeUndefined();
    expect(g.drawOrder).toHaveLength(1);
  });
});
