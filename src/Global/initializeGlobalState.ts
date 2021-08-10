import { VFusen } from "../VFusen";
import { TFusenItem } from "../Fusen/FusenItem";
import { TGroupItem } from "../Group/GroupItem";
import { TUser } from "../Cloud/FirestoreIO";

export const INITIAL_GLOBAL_STATE = {
  fusens: [] as VFusen[], // for small tests

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
  clicked_fusen: "" as "" | ItemId,

  statusBar: { text: "", type: "no-connection" as TStatusType },
  user: null as TUser,
  cloud_ba: "",
  usingFirestoreEmulator: false,
  last_updated: 0,
  is_local_change: false,

  in_tutorial: false,
  tutorial_page: 0,

  show_devmenu: true,
};

type TDragTarget = "" | "selection" | ItemId;
export type TItem = TFusenItem | TGroupItem;
enum ItemIdBrand {
  _ = "",
}
export type ItemId = ItemIdBrand & string;

type TDialog = "" | "AddFusen" | "Tutorial" | "Sign" | "CloudSave";
export type TMenu = "" | "Main" | "Dev" | "Fusen" | "Selection" | "Group";
type TStatusType =
  | "text"
  | "no-connection"
  | "loading"
  | "done"
  | "uploading"
  | "downloading"
  | "text";
type TMenuAnchor = null | Element;
type TMouseState = "" | "selecting";

type TYPE_GLOBAL_STATE = typeof INITIAL_GLOBAL_STATE;

declare module "reactn/default" {
  export interface State extends TYPE_GLOBAL_STATE {}
}
