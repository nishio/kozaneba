import { TUser } from "../Cloud/init_firebase";
import { TWorldCoord } from "../dimension/world_to_screen";
import { TDialog } from "./TDialog";
import { TAnnotation } from "./TAnnotation";
import { TItem } from "./TItem";
import { TItemId } from "./TItemId";
import { TMenu } from "./TMenu";
import { TStatusType } from "./TStatusType";

export const INITIAL_GLOBAL_STATE = {
  drawOrder: [] as TItemId[],
  itemStore: {} as { [id: string]: TItem },
  scale: 1,
  trans_x: 0,
  trans_y: 0,

  dialog: "" as TDialog,
  menu: "" as TMenu,
  menu_anchor: null as TMenuAnchor,

  dragstart_position: [0, 0] as TWorldCoord,
  drag_target: "" as TDragTarget,
  selectionRange: { top: 0, left: 0, width: 0, height: 0 },
  selected_items: [] as TItemId[],
  is_selected: false,
  mouseState: "" as TMouseState,
  clicked_target: "" as "" | TItemId,

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

  title: "",
  writers: [] as string[],
  anyone_writable: true,

  disableHotKey: false,

  annotations: [] as TAnnotation[],

  scrapbox: "" as string,
};

type TDragTarget = "" | "selection" | TItemId;

type TMenuAnchor = null | Element;
type TMouseState = "" | "selecting" | "middle_dragging";

type TYPE_GLOBAL_STATE = typeof INITIAL_GLOBAL_STATE;

declare module "reactn/default" {
  export interface State extends TYPE_GLOBAL_STATE {}
}
