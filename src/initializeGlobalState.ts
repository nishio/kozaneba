import { VFusen } from "./VFusen";

export const INITIAL_GLOBAL_STATE = {
  fusens: [] as VFusen[],
};

type TYPE_GLOBAL_STATE = typeof INITIAL_GLOBAL_STATE;

declare module "reactn/default" {
  export interface State extends TYPE_GLOBAL_STATE {}
}
