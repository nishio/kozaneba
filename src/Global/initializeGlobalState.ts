import { VKozane } from "../VKozane";
import { TKozaneItem } from "../Kozane/KozaneItem";
import { TGroupItem } from "../Group/GroupItem";
import { TUser } from "../Cloud/FirestoreIO";

export const INITIAL_GLOBAL_STATE = {
  kozane: [] as VKozane[], // for small tests

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
  clicked_kozane: "" as "" | ItemId,

  statusBar: { text: "", type: "no-connection" as TStatusType },
  user: null as TUser,
  cloud_ba: "",
  usingFirestoreEmulator: false,
  last_updated: 0,
  is_local_change: false,

  in_tutorial: false,
  tutorial_page: 0,

  show_devmenu: true,
  fix_timestamp_for_test: null as null | number,
  fix_ba_for_test: "",

  add_kozane_text: "",
};

type TDragTarget = "" | "selection" | ItemId;
export type TItem = TKozaneItem | TGroupItem;
enum ItemIdBrand {
  _ = "",
}
export type ItemId = ItemIdBrand & string;

type TDialog = "" | "AddKozane" | "Tutorial" | "Sign" | "CloudSave";
export type TMenu = "" | "Main" | "Dev" | "Kozane" | "Selection" | "Group";
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
