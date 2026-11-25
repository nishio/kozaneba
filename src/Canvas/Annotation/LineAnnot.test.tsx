import { act, fireEvent, render, screen } from "@testing-library/react";
import { getGlobal, setGlobal } from "reactn";
import { INITIAL_GLOBAL_STATE } from "../../Global/initializeGlobalState";
import { TAnnotation } from "../../Global/TAnnotation";
import { TItemId } from "../../Global/TItemId";
import { TWorldCoord } from "../../dimension/world_to_screen";
import { resolve_annotation_ref } from "../../utils/annotation_ref";
import { vi } from "vitest";
import { AnnotationLayer } from "./AnnotationLayer";

// LineAnnot imports the API, which would initialize Firebase Auth
vi.mock("firebaseui", () => ({ auth: { AuthUI: vi.fn() } }));
vi.mock("../../Cloud/init_firebase", () => ({
  db: {},
  auth: { onAuthStateChanged: vi.fn(), currentUser: null },
}));

// jsdom has no scrollIntoView (the inline editor calls it on focus)
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const id = (value: string) => value as TItemId;
const kozane = (value: string, x: number, y: number) => ({
  type: "kozane" as const,
  id: id(value),
  text: value,
  position: [x, y] as TWorldCoord,
  scale: 1,
});
const line = (items: string[], label: string): TAnnotation => ({
  type: "line",
  items: items.map(id),
  heads: items.map(() => "none"),
  is_doubled: false,
  label,
  custom: {},
});

const pq = line(["P", "Q"], "pq");
const first = line(["A", "B"], "first");
const second = line(["A", "B"], "second");

// [P–Q, A–B "first", A–B "second"]: the last two have the same items (e.g. a
// plain line and an arrow between the same kozane)
const setup = () => {
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    drawOrder: [id("A"), id("B"), id("P"), id("Q")],
    itemStore: {
      A: kozane("A", 0, 0),
      B: kozane("B", 500, 0),
      P: kozane("P", 0, 500),
      Q: kozane("Q", 500, 500),
    },
    annotations: [pq, first, second],
  });
  render(<AnnotationLayer />);
};

// another client's save replaces the whole array
const receive = (annotations: TAnnotation[]) =>
  act(() => {
    setGlobal({ annotations });
  });

const labels = () => getGlobal().annotations.map((a) => a.label);

describe("LineAnnot with two lines between the same kozane", () => {
  test("right click on the second one: the dialog follows it when an earlier line is removed", () => {
    setup();
    fireEvent.contextMenu(screen.getByTestId("line-label-hit-2-0"));
    const ref = getGlobal().clicked_annotation;
    expect(resolve_annotation_ref(getGlobal().annotations, ref)).toBe(2);

    receive([first, second]);
    expect(resolve_annotation_ref(getGlobal().annotations, ref)).toBe(1);
  });

  test("double click on the second one: the inline editor saves into it after an earlier line is removed", () => {
    setup();
    fireEvent.doubleClick(screen.getByTestId("line-label-hit-2-0"));
    expect(screen.getByDisplayValue("second")).toBeInTheDocument();

    receive([first, second]);
    const editor = screen.getByDisplayValue("second");
    fireEvent.change(editor, { target: { value: "edited" } });
    fireEvent.keyDown(screen.getByDisplayValue("edited"), { key: "Enter" });
    expect(labels()).toEqual(["first", "edited"]);
  });
});
