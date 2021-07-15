import { VFusen } from "./VFusen";

export type FusenItem = {
  type: "piece";
  text: string;
  position: number[];
  id: ItemId;
  scale: number;
};

export type GroupItem = {
  type: "group";
  title: string;
  position: number[];
  items: ItemId[];
  id: ItemId;
  scale: number; // scale of Nameplate Fusen
  isOpen: boolean;
};

type Item = FusenItem | GroupItem;
enum ItemIdBrand {
  _ = "",
}
export type ItemId = ItemIdBrand & string;

type TDialog = "" | "AddFusen";

export const INITIAL_GLOBAL_STATE = {
  fusens: [] as VFusen[],
  drawOrder: [] as ItemId[],
  itemStore: {} as { [id: string]: Item },
  scale: 1,
  trans_x: 0,
  trans_y: 0,
  dialog: "" as TDialog,
};

type TYPE_GLOBAL_STATE = typeof INITIAL_GLOBAL_STATE;

declare module "reactn/default" {
  export interface State extends TYPE_GLOBAL_STATE {}
}
