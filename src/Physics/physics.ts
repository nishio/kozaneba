import { getGlobal } from "reactn";
import { State } from "reactn/default";
import { redraw } from "../API/redraw";
import { add_v2, L2norm, mul_v2, normalize, V2 } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { ItemRepulse } from "./ItemRepulse";
import { LineSpring } from "./LineSpring";
import { pin } from "./pin";

export type Gradient = { [id: string]: V2 };
export type PhysicalLaw = (state: State) => Gradient; // return Negative Gradient(aka Power)

const square = (v: V2): V2 => {
  return [v[0] * v[0], v[1] * v[1]];
};

const sq_div = (v1: V2, v2: V2): V2 => {
  // element-wise division, safe for 0/0
  return [
    v1[0] === 0 ? 0 : Math.sqrt(v1[0]) / (Math.sqrt(v2[0]) + 1),
    v1[0] === 0 ? 0 : Math.sqrt(v1[1]) / (Math.sqrt(v2[1]) + 1),
  ];
};

const mul = (v1: V2, v2: V2): V2 => {
  // element-wise multiply
  return [v1[0] * v2[0], v1[1] * v2[1]];
};

class AdaDelta {
  mean_squared_gradient: Gradient;
  mean_squared_delta: Gradient;
  gamma: number;
  constructor(gamma = 0.95) {
    this.mean_squared_gradient = {};
    this.mean_squared_delta = {};
    this.gamma = gamma;
  }
  get_delta(gradient: Gradient) {
    const delta: Gradient = {};
    Object.entries(gradient).forEach(([key, grad]) => {
      // update mean_squared_gradient
      const msg = (this.mean_squared_gradient[key] = add_v2(
        mul_v2(this.gamma, this.mean_squared_gradient[key] ?? [0, 0]),
        mul_v2(1 - this.gamma, square(grad))
      ));

      // calc update-delta
      const prev_msd = this.mean_squared_delta[key] ?? mul_v2(0.5, msg);
      delta[key] = mul(sq_div(prev_msd, msg), grad);

      // update mean squared update delta
      this.mean_squared_delta[key] = add_v2(
        mul_v2(this.gamma, prev_msd),
        mul_v2(1 - this.gamma, square(delta[key]!))
      );
    });
    // console.log("MSG", this.mean_squared_gradient);
    // console.log("MSD", this.mean_squared_delta);

    return delta;
  }
}

class GradientDecent {
  gamma: number;
  constructor(gamma = 0.95) {
    this.gamma = gamma;
  }
  get_delta(gradient: Gradient) {
    const delta: Gradient = {};
    Object.entries(gradient).forEach(([key, grad]) => {
      // update mean_squared_gradient

      // calc update-delta
      const TERMINAL_VELOCITY = 200;
      const vel = L2norm(grad);
      if (vel > TERMINAL_VELOCITY) {
        grad = mul_v2(TERMINAL_VELOCITY, normalize(grad));
      }
      delta[key] = grad;
    });

    return delta;
  }
}

export const add = (grad: Gradient, id: ItemId, v: V2): void => {
  grad[id] = add_v2(grad[id] ?? [0, 0], v);
};

interface IGradientMethod {
  get_delta: (gradient: Gradient) => Gradient;
}
let gradient_method: IGradientMethod = new GradientDecent();

export const step = () => {
  console.time("Physics step");
  const g = getGlobal();
  // const grad = LineSpring(g);
  const grad = {};
  const laws = [LineSpring, ItemRepulse];
  laws.forEach((law) => {
    const _grad = law(g);
    Object.entries(_grad).forEach(([key, v]) => {
      add(grad, key as ItemId, v);
    });
  });
  const delta = gradient_method.get_delta(grad);
  // console.log("delta", delta);
  updateGlobal((g) => {
    Object.entries(delta).forEach(([id, v]) => {
      if (pin[id] !== undefined) {
        // it is pinned, should not update position
        return;
      }
      const item = g.itemStore[id]!;
      item.position = add_v2(item.position, v) as TWorldCoord;
    });
  });
  // console.log("itemStore", getGlobal().itemStore);
  console.timeEnd("Physics step");
  redraw();
};

let timer: null | NodeJS.Timer = null;
export const toggle_physics = () => {
  if (timer === null) {
    gradient_method = new GradientDecent();
    timer = setInterval(step, 100);
  } else {
    clearInterval(timer);
    timer = null;
  }
};
export const is_physics_on = () => {
  return timer !== null;
};
