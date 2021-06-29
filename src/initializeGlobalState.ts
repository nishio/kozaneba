import { VFusen } from "./VFusen";

export const INITIAL_GLOBAL_STATE = {
  fusens: [] as VFusen[],
  scale: 1,
  trans_x: 0,
  trans_y: 0,
};

type TYPE_GLOBAL_STATE = typeof INITIAL_GLOBAL_STATE;

declare module "reactn/default" {
  export interface State extends TYPE_GLOBAL_STATE {}
}
