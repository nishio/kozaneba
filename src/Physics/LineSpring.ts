import { L2norm, mul_v2, normalize, sub_v2 } from "../dimension/V2";
import { KOZANE_WIDTH } from "../Kozane/kozane_constants";
import { get_gravity_point } from "../dimension/get_gravity_point";
import { PhysicalLaw, Gradient, add } from "./physics";
import { State } from "reactn/default";
import { add_v2, V2 } from "../dimension/V2";
import { get_group } from "../Event/get_group";
import { get_item } from "../Event/get_item";
import { ItemId } from "../Global/initializeGlobalState";
import { find_parent } from "../Group/find_parent";

const get_global_position = (id: ItemId, g: State): V2 => {
  // potential time-consuming function
  let v: V2 = get_item(g, id).position;
  let p = find_parent(id);
  while (p !== null) {
    const group = get_group(g, p);
    if (group.isOpen) {
      v = add_v2(v, get_item(g, p).position);
    } else {
      v = group.position;
    }
    p = find_parent(p);
  }
  if (isNaN(v[0]) || v[0] === undefined || isNaN(v[1]) || v[1] === undefined) {
    throw new Error(
      `invalid V2 found: [${v[0]}, ${v[1]}] when get_global_position id:${id}`
    );
  }
  return v;
};

export const LineSpring: PhysicalLaw = (g) => {
  const NL = KOZANE_WIDTH; // natural length
  const grad: Gradient = {};
  g.annotations.forEach((a) => {
    if (a.type !== "line") return;
    const positions = a.items.map((id) => get_global_position(id, g));
    const gp = get_gravity_point(positions);
    a.items.forEach((id, index) => {
      const v = sub_v2(gp, positions[index]!);
      const n = L2norm(v);
      // console.log("n", n);
      if (n > NL) {
        add(grad, id, mul_v2(n - NL, normalize(v)));
      }
    });
  });
  // console.log("LineSpring grad", grad);
  return grad;
};
