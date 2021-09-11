import { get_global_position } from "../dimension/get_global_position";
import { L2norm, mul_v2, normalize, sub_v2 } from "../dimension/V2";
import { KOZANE_HEIGHT, KOZANE_WIDTH } from "../utils/kozane_constants";
import { PhysicalLaw, Gradient, add } from "./physics";

export const ItemRepulse: PhysicalLaw = (g) => {
  const RADIUS = Math.sqrt(KOZANE_WIDTH ** 2 + KOZANE_HEIGHT ** 2);
  const grad: Gradient = {};
  const positions = g.drawOrder.map((id) => get_global_position(id, g));
  g.drawOrder.forEach((id1, i1) => {
    g.drawOrder.forEach((id2, i2) => {
      if (i1 >= i2) return;
      const v = sub_v2(positions[i1]!, positions[i2]!);
      const n = L2norm(v);
      if (n < RADIUS) {
        const nv = normalize(v);
        const f = (RADIUS - n) / 2;
        add(grad, id1, mul_v2(f, nv));
        add(grad, id2, mul_v2(-f, nv));
      }
    });
  });
  return grad;
};
