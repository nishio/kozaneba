import { DocData } from "./FirebaseShortTypename";
import { TStatusType } from "../Global/TStatusType";
import { TDialog } from "../Global/TDialog";

export const docdate_to_state = (data: DocData) => {
  // Convert document data to application state
  return {
    itemStore: data.itemStore || {},
    drawOrder: data.drawOrder || [],
    annotations: data.annotations || [],
    ba: data.id,
    ba_title: data.title || "",
    writers: data.writers || [],
    last_updated: data.last_updated || 0,
    // Add other state properties with defaults
    dialog: "" as TDialog,
    menu_anchor: null,
    menu_type: "",
    selected_items: [],
    clipboard: [],
    // Add other required state properties
  };
};
