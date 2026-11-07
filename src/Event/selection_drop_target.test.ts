import { setGlobal } from "reactn";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TItemId } from "../Global/TItemId";
import { get_drop_group_id } from "./drop_target";
import { get_valid_selection_drop_group_id } from "./drop_validity";
import * as fast_drag_manager from "./fast_drag_manager";

const id = (value: string) => value as TItemId;

const group = (value: string, items: string[]) => ({
  type: "group",
  id: id(value),
  text: "",
  position: [0, 0],
  items: items.map(id),
  scale: 1,
  isOpen: true,
});

const put_group_div = (parent: HTMLElement, group_id: string) => {
  const div = document.createElement("div");
  div.id = `group-${group_id}`;
  div.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: 100, bottom: 100 } as DOMRect);
  parent.appendChild(div);
  return div;
};

describe("selection drop target", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  test("the bbox fallback ignores the dragged selection and its groups", () => {
    const other = put_group_div(document.body, "other");
    const selection = document.createElement("div");
    document.body.appendChild(selection);
    put_group_div(selection, "selected");
    document.elementFromPoint = () => document.body;
    vi.spyOn(fast_drag_manager, "get_dragging_element").mockReturnValue(selection);

    const event = { clientX: 50, clientY: 50 } as unknown as Parameters<
      typeof get_drop_group_id
    >[0];
    expect(get_drop_group_id(event)).toBe("other");

    other.remove();
    expect(get_drop_group_id(event)).toBe(null);
  });

  test("a selection is not dropped into a selected group or its descendants", () => {
    setGlobal({
      ...INITIAL_GLOBAL_STATE,
      itemStore: {
        G: group("G", ["H"]),
        H: group("H", []),
        X: group("X", []),
      },
      drawOrder: [id("G"), id("X")],
    });
    const selected = [id("G")];
    expect(get_valid_selection_drop_group_id(id("G"), selected)).toBe(null);
    expect(get_valid_selection_drop_group_id(id("H"), selected)).toBe(null);
    expect(get_valid_selection_drop_group_id(id("X"), selected)).toBe("X");
    expect(get_valid_selection_drop_group_id(null, selected)).toBe(null);
  });
});
