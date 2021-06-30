import { VFusen } from "./VFusen";

export type FusenItem = {
  type: "piece";
  text: string;
  position: number[];
};

type GroupItem = {
  type: "group";
  title: string;
  position: number[];
};

type Item = FusenItem | GroupItem;
enum ItemIdBrand {
  _ = "",
}
type ItemId = ItemIdBrand & string;

export const INITIAL_GLOBAL_STATE = {
  fusens: [] as VFusen[],
  drawOrder: [] as ItemId[],
  itemStore: {} as { [id: string]: Item },
  scale: 1,
  trans_x: 0,
  trans_y: 0,
};

type TYPE_GLOBAL_STATE = typeof INITIAL_GLOBAL_STATE;

declare module "reactn/default" {
  export interface State extends TYPE_GLOBAL_STATE {}
}
