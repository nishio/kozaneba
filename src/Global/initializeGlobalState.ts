import { VFusen } from "../VFusen";
import { TFusenItem } from "../Fusen/FusenItem";
import { TGroupItem } from "../Group/GroupItem";

export const INITIAL_GLOBAL_STATE = {
  fusens: [] as VFusen[],
  drawOrder: [] as ItemId[],
  itemStore: {} as { [id: string]: TItem },
  scale: 1,
  trans_x: 0,
  trans_y: 0,
  dialog: "" as TDialog,
  menu: "" as TMenu,
  menu_anchor: null as TMenuAnchor,
  dragstart_position: [0, 0],
  drag_target: "" as TDragTarget,
  selectionRange: { top: 0, left: 0, width: 0, height: 0 },
  selected_items: [] as ItemId[],
  is_selected: false,
  mouseState: "" as TMouseState,
  clicked_group: "" as "" | ItemId,
};

type TDragTarget = "" | "selection" | ItemId;
export type TItem = TFusenItem | TGroupItem;
enum ItemIdBrand {
  _ = "",
}
export type ItemId = ItemIdBrand & string;

type TDialog = "" | "AddFusen";
export type TMenu = "" | "Main" | "Dev" | "Fusen" | "Selection" | "Group";
type TMenuAnchor = null | Element;

type TMouseState = "" | "selecting";

type TYPE_GLOBAL_STATE = typeof INITIAL_GLOBAL_STATE;

declare module "reactn/default" {
  export interface State extends TYPE_GLOBAL_STATE {}
}
