import { State } from "reactn/default";
import { TWorldCoord } from "../dimension/world_to_screen";
import { GroupItem } from "../Group/GroupItem";
import { KozaneItem } from "../Kozane/KozaneItem";
import { TItemId } from "../Global/TItemId";

// A small board that exercises the touch paths worth recording: loose
// kozane to drag, an open group to drop into, a nested group, a closed
// group, and a line between two kozane. Ids are fixed so recordings made
// on it replay against the same ids.
export const load_sample_board = (g: State) => {
  const ids = (...xs: string[]) => xs as TItemId[];
  const kozane = (id_: string, text: string, x: number, y: number) => {
    const id = id_ as TItemId;
    const k = new KozaneItem(id);
    k.text = text;
    k.position = [x, y] as TWorldCoord;
    g.itemStore[id] = k;
    return k;
  };
  const group = (id_: string, text: string, x: number, y: number, items: string[], isOpen = true) => {
    const id = id_ as TItemId;
    const gr = new GroupItem(id);
    gr.text = text;
    gr.position = [x, y] as TWorldCoord;
    gr.items = ids(...items);
    gr.isOpen = isOpen;
    g.itemStore[id] = gr;
    return gr;
  };

  g.itemStore = {};
  kozane("k1", "drag me", -300, -150);
  kozane("k2", "pinch around me", -300, 50);
  kozane("k3", "line from", -300, 250);
  kozane("k4", "line to", -80, 250);
  kozane("a1", "in group A", -60, -20);
  kozane("a2", "also in A", 60, -20);
  kozane("n1", "nested", 0, 20);
  group("gn", "nested group", 0, 60, ["n1"]);
  group("ga", "group A", 200, -60, ["a1", "a2", "gn"]);
  kozane("c1", "hidden", 0, 0);
  group("gc", "closed group", 200, 250, ["c1"], false);
  g.drawOrder = ids("k1", "k2", "k3", "k4", "ga", "gc");
  g.annotations = [
    {
      type: "line",
      items: ids("k3", "k4"),
      heads: ["none", "arrow"],
      is_doubled: false,
      custom: {},
    },
  ];
  g.scale = 1;
  g.trans_x = 0;
  g.trans_y = 0;
};
