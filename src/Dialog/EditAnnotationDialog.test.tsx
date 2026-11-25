import { act, fireEvent, render, screen } from "@testing-library/react";
import { getGlobal, setGlobal } from "reactn";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TAnnotation } from "../Global/TAnnotation";
import { TItemId } from "../Global/TItemId";
import { ref_of_annotation } from "../utils/annotation_ref";
import { EditAnnotationDialog } from "./EditAnnotationDialog";

const line = (items: string[], label: string): TAnnotation => ({
  type: "line",
  items: items as TItemId[],
  heads: items.map(() => "none"),
  is_doubled: false,
  label,
  custom: {},
});

// Two lines between the same kozane (e.g. a plain line and an arrow drawn
// from A to B) have the same items. Annotations have no id, so the dialog
// tells them apart by the array index.
const open_dialog = (annotations: TAnnotation[], index: number) => {
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    annotations,
    dialog: "EditAnnotation",
    clicked_annotation: ref_of_annotation(annotations, index),
  });
  render(<EditAnnotationDialog />);
};

// another client's save replaces the whole array
const receive = (annotations: TAnnotation[]) =>
  act(() => {
    setGlobal({ annotations });
  });

const labels = () => getGlobal().annotations.map((a) => a.label);

describe("EditAnnotationDialog with two lines between the same kozane", () => {
  test("another client removes an unrelated earlier line: the dialog still edits the same line", () => {
    const pq = line(["P", "Q"], "pq");
    const first = line(["A", "B"], "first");
    const second = line(["A", "B"], "second");
    open_dialog([pq, first, second], 2);
    expect(screen.getByLabelText("Label")).toHaveValue("second");

    receive([first, second]);
    fireEvent.change(screen.getByLabelText("Label"), {
      target: { value: "edited" },
    });
    expect(labels()).toEqual(["first", "edited"]);
  });

  test("another client removes the edited line: the dialog closes, it does not move to the other line", () => {
    const first = line(["A", "B"], "first");
    const second = line(["A", "B"], "second");
    open_dialog([first, second], 0);

    receive([second]);
    expect(screen.queryByLabelText("Label")).toBeNull();
    expect(getGlobal().clicked_annotation).toBeNull();
    expect(labels()).toEqual(["second"]);
  });
});
