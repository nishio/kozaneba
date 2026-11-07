import { getGlobal } from "reactn";
import { THICK_ARROW } from "../API/add_arrow";
import { screen_to_world } from "../dimension/world_to_screen";
import {
  TAnyInputEvent,
  TInputEvent,
  get_button,
  get_client_pos,
  should_ignore_compat_mouse_event,
} from "../Event/input_event";
import { capture_pointer_on_canvas } from "../Event/fast_drag_manager";
import { TLineAnnot } from "./TAnnotation";
import { TItemId } from "./TItemId";
import { TLineEditStyle } from "./initializeGlobalState";
import { updateGlobal } from "./updateGlobal";
import { mark_local_changed } from "../utils/mark_local_changed";

const get_target_kozane_id = (client_x: number, client_y: number): "" | TItemId => {
  const element = document.elementFromPoint(client_x, client_y);
  if (!(element instanceof Element)) return "";
  const kozane = element.closest(".kozane");
  if (!(kozane instanceof HTMLElement)) return "";
  const id = kozane.dataset.testid as TItemId | undefined;
  if (id === undefined) return "";
  const item = getGlobal().itemStore[id];
  if (item?.type !== "kozane") return "";
  return id;
};

const get_target_kozane_id_from_event = (
  event: TAnyInputEvent<Element>
): "" | TItemId => {
  const [client_x, client_y] = get_client_pos(event);
  return get_target_kozane_id(client_x, client_y);
};

const apply_line_edit_label = (
  annotation: TLineAnnot,
  value: string
): boolean => {
  const label = value.trim();
  if (label === "") {
    if (annotation.label === undefined) return false;
    delete annotation.label;
    return true;
  }
  if ((annotation.label ?? "") === label) return false;
  annotation.label = label;
  return true;
};

export const is_line_editor_interaction_target = (
  target: EventTarget | null
): boolean => {
  if (!(target instanceof Element)) return false;
  return target.closest("[data-line-editor-root='true']") !== null;
};

export const commitLineEdit = (): boolean => {
  const edit_state = getGlobal().line_edit_state;
  if (edit_state === null) return false;
  let did_change = false;
  updateGlobal((draft) => {
    const state = draft.line_edit_state;
    if (state !== null) {
      const annotation = draft.annotations[state.annot_index];
      if (annotation?.type === "line") {
        did_change = apply_line_edit_label(annotation, state.value);
      }
    }
    draft.line_edit_state = null;
    draft.disableHotKey = false;
  });
  if (did_change) {
    mark_local_changed();
  }
  return true;
};

export const openLineEdit = (annot_index: number): void => {
  let did_change = false;
  updateGlobal((draft) => {
    const current = draft.line_edit_state;
    if (current !== null && current.annot_index !== annot_index) {
      const current_annotation = draft.annotations[current.annot_index];
      if (current_annotation?.type === "line") {
        did_change = apply_line_edit_label(current_annotation, current.value);
      }
    }
    const annotation = draft.annotations[annot_index];
    if (annotation?.type !== "line" || annotation.items.length !== 2) return;
    draft.line_edit_state = {
      annot_index,
      value: annotation.label ?? "",
      retarget_endpoint: null,
      pointer: null,
      hover_target: "",
    };
    draft.disableHotKey = true;
  });
  if (did_change) {
    mark_local_changed();
  }
};

export const updateLineEditValue = (
  annot_index: number,
  value: string
): void => {
  updateGlobal((draft) => {
    if (draft.line_edit_state?.annot_index === annot_index) {
      draft.line_edit_state.value = value;
    }
  });
};

export const setLineEditStyle = (
  annot_index: number,
  style: TLineEditStyle
): void => {
  let did_change = false;
  updateGlobal((draft) => {
    const annotation = draft.annotations[annot_index];
    if (annotation?.type !== "line") return;
    const next = {
      heads: ["none", "none"] as TLineAnnot["heads"],
      is_doubled: false,
    };
    if (style === "arrow") {
      next.heads = ["none", "arrow"];
    } else if (style === "double_heads") {
      next.heads = ["arrow", "arrow"];
    } else if (style === "double_lines") {
      next.is_doubled = true;
    }
    did_change =
      annotation.is_doubled !== next.is_doubled ||
      annotation.heads[0] !== next.heads[0] ||
      annotation.heads[1] !== next.heads[1];
    annotation.heads = next.heads;
    annotation.is_doubled = next.is_doubled;
  });
  if (did_change) {
    mark_local_changed();
  }
};

export const deleteLineEditAnnotation = (annot_index: number): void => {
  let did_delete = false;
  updateGlobal((draft) => {
    if (draft.annotations[annot_index]?.type !== "line") return;
    draft.annotations.splice(annot_index, 1);
    draft.line_edit_state = null;
    draft.disableHotKey = false;
    did_delete = true;
  });
  if (did_delete) {
    mark_local_changed();
  }
};

export const startAnchorLineDrag = (
  event: TInputEvent<HTMLElement>,
  start_id: TItemId
): void => {
  if (should_ignore_compat_mouse_event(event)) return;
  if (get_button(event) !== 0) return;
  commitLineEdit();
  capture_pointer_on_canvas(event);
  const pointer = screen_to_world(get_client_pos(event));
  updateGlobal((draft) => {
    draft.mouseState = "drawing_line_anchor";
    draft.line_start = "";
    draft.drag_target = "";
    draft.line_draft_state = {
      start_id,
      pointer,
      hover_target: "",
    };
    draft.disableHotKey = true;
  });
  event.preventDefault();
  event.stopPropagation();
};

export const updateAnchorLineDrag = (
  event: TAnyInputEvent<Element>
): boolean => {
  const g = getGlobal();
  if (g.mouseState !== "drawing_line_anchor" || g.line_draft_state === null) {
    return false;
  }
  const pointer = screen_to_world(get_client_pos(event));
  const hover_target = get_target_kozane_id_from_event(event);
  updateGlobal((draft) => {
    const state = draft.line_draft_state;
    if (state === null) return;
    state.pointer = pointer;
    state.hover_target =
      hover_target !== "" && hover_target !== state.start_id ? hover_target : "";
  });
  return true;
};

export const finishAnchorLineDrag = (
  event: TAnyInputEvent<Element>
): boolean => {
  const g = getGlobal();
  if (g.mouseState !== "drawing_line_anchor" || g.line_draft_state === null) {
    return false;
  }
  const target_id = get_target_kozane_id_from_event(event);
  let did_create = false;
  updateGlobal((draft) => {
    const state = draft.line_draft_state;
    if (state !== null && target_id !== "" && target_id !== state.start_id) {
      const annotation: TLineAnnot = {
        type: "line",
        items: [state.start_id, target_id],
        heads: ["none", "none"],
        is_doubled: false,
        custom: THICK_ARROW,
      };
      draft.annotations.push(annotation);
      draft.line_edit_state = {
        annot_index: draft.annotations.length - 1,
        value: "",
        retarget_endpoint: null,
        pointer: null,
        hover_target: "",
      };
      draft.disableHotKey = true;
      did_create = true;
    } else {
      draft.disableHotKey = false;
    }
    draft.mouseState = "";
    draft.line_draft_state = null;
  });
  if (did_create) {
    mark_local_changed();
  }
  event.preventDefault();
  event.stopPropagation();
  return true;
};

export const startLineEndpointRetarget = (
  event: TInputEvent<Element>,
  annot_index: number,
  endpoint: 0 | 1
): void => {
  if (should_ignore_compat_mouse_event(event)) return;
  if (get_button(event) !== 0) return;
  capture_pointer_on_canvas(event);
  const pointer = screen_to_world(get_client_pos(event));
  const hover_target = get_target_kozane_id_from_event(event);
  updateGlobal((draft) => {
    const annotation = draft.annotations[annot_index];
    if (annotation?.type !== "line" || annotation.items.length !== 2) return;
    const value =
      draft.line_edit_state?.annot_index === annot_index
        ? draft.line_edit_state.value
        : annotation.label ?? "";
    draft.mouseState = "retargeting_line_endpoint";
    draft.line_edit_state = {
      annot_index,
      value,
      retarget_endpoint: endpoint,
      pointer,
      hover_target,
    };
    draft.disableHotKey = true;
  });
  event.preventDefault();
  event.stopPropagation();
};

export const updateLineEndpointRetarget = (
  event: TAnyInputEvent<Element>
): boolean => {
  const g = getGlobal();
  if (
    g.mouseState !== "retargeting_line_endpoint" ||
    g.line_edit_state?.retarget_endpoint === null
  ) {
    return false;
  }
  const pointer = screen_to_world(get_client_pos(event));
  const hover_target = get_target_kozane_id_from_event(event);
  updateGlobal((draft) => {
    const state = draft.line_edit_state;
    if (state === null || state.retarget_endpoint === null) return;
    const annotation = draft.annotations[state.annot_index];
    if (annotation?.type !== "line" || annotation.items.length !== 2) return;
    const other_id = annotation.items[state.retarget_endpoint === 0 ? 1 : 0];
    state.pointer = pointer;
    state.hover_target =
      hover_target !== "" && hover_target !== other_id ? hover_target : "";
  });
  return true;
};

export const finishLineEndpointRetarget = (
  event: TAnyInputEvent<Element>
): boolean => {
  const g = getGlobal();
  if (
    g.mouseState !== "retargeting_line_endpoint" ||
    g.line_edit_state?.retarget_endpoint === null
  ) {
    return false;
  }
  const target_id = get_target_kozane_id_from_event(event);
  let did_change = false;
  updateGlobal((draft) => {
    const state = draft.line_edit_state;
    if (state === null || state.retarget_endpoint === null) return;
    const annotation = draft.annotations[state.annot_index];
    if (annotation?.type === "line" && annotation.items.length === 2) {
      const endpoint = state.retarget_endpoint;
      const other_id = annotation.items[endpoint === 0 ? 1 : 0];
      if (
        target_id !== "" &&
        target_id !== other_id &&
        annotation.items[endpoint] !== target_id
      ) {
        annotation.items[endpoint] = target_id;
        did_change = true;
      }
    }
    state.retarget_endpoint = null;
    state.pointer = null;
    state.hover_target = "";
    draft.mouseState = "";
    draft.disableHotKey = true;
  });
  if (did_change) {
    mark_local_changed();
  }
  event.preventDefault();
  event.stopPropagation();
  return true;
};

export const clearLineInteraction = (): void => {
  updateGlobal((draft) => {
    draft.line_draft_state = null;
    if (draft.line_edit_state !== null) {
      draft.line_edit_state.retarget_endpoint = null;
      draft.line_edit_state.pointer = null;
      draft.line_edit_state.hover_target = "";
    }
    if (
      draft.mouseState === "drawing_line_anchor" ||
      draft.mouseState === "retargeting_line_endpoint"
    ) {
      draft.mouseState = "";
    }
    if (draft.line_edit_state === null) {
      draft.disableHotKey = false;
    }
  });
};
