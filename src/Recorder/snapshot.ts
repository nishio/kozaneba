import { State } from "reactn/default";
import { TItem } from "../Global/TItem";

// The part of the app state that a touch session changes and a replay can
// check: layout, nesting, view and the open UI. Text is replaced by its
// length so a recording made on a real board does not carry its content.
export type TSnapItem = {
  type: TItem["type"];
  position: [number, number];
  scale: number;
  text_length?: number;
  items?: string[];
  isOpen?: boolean;
};
export type TSnapshot = {
  scale: number;
  trans_x: number;
  trans_y: number;
  drawOrder: string[];
  itemStore: { [id: string]: TSnapItem };
  annotations: { type: string; items: string[]; heads: string[] }[];
  selected_items: string[];
  menu: string;
  dialog: string;
  mouseState: string;
};

const snap_item = (item: TItem): TSnapItem => {
  const ret: TSnapItem = {
    type: item.type,
    position: [item.position[0], item.position[1]],
    scale: item.scale,
  };
  if ("text" in item && typeof item.text === "string") {
    ret.text_length = item.text.length;
  }
  if (item.type === "group") {
    ret.items = [...item.items];
    ret.isOpen = item.isOpen;
  }
  return ret;
};

export const snapshot = (g: State): TSnapshot => {
  const itemStore: TSnapshot["itemStore"] = {};
  Object.entries(g.itemStore).forEach(([id, item]) => {
    itemStore[id] = snap_item(item);
  });
  return {
    scale: g.scale,
    trans_x: g.trans_x,
    trans_y: g.trans_y,
    drawOrder: [...g.drawOrder],
    itemStore,
    annotations: g.annotations.map((a) => ({
      type: a.type,
      items: [...a.items],
      heads: [...a.heads],
    })),
    selected_items: [...g.selected_items],
    menu: g.menu,
    dialog: g.dialog,
    mouseState: g.mouseState,
  };
};

// Differences that matter to a person looking at the board. Positions and
// the view may drift by a few pixels between devices; structure must match.
export const diff_snapshot = (
  expected: TSnapshot,
  actual: TSnapshot,
  tolerance = 4
): string[] => {
  const out: string[] = [];
  const close = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
  const same = (a: unknown, b: unknown) =>
    JSON.stringify(a) === JSON.stringify(b);

  if (!close(expected.scale, actual.scale, expected.scale * 0.02)) {
    out.push(`scale ${expected.scale} -> ${actual.scale}`);
  }
  for (const k of ["trans_x", "trans_y"] as const) {
    if (!close(expected[k], actual[k], tolerance)) {
      out.push(`${k} ${expected[k]} -> ${actual[k]}`);
    }
  }
  for (const k of [
    "drawOrder",
    "selected_items",
    "menu",
    "dialog",
    "mouseState",
    "annotations",
  ] as const) {
    if (!same(expected[k], actual[k])) {
      out.push(`${k} ${JSON.stringify(expected[k])} -> ${JSON.stringify(actual[k])}`);
    }
  }
  const ids = new Set([
    ...Object.keys(expected.itemStore),
    ...Object.keys(actual.itemStore),
  ]);
  ids.forEach((id) => {
    const e = expected.itemStore[id];
    const a = actual.itemStore[id];
    if (e === undefined || a === undefined) {
      out.push(`item ${id} ${e ? "missing" : "unexpected"}`);
      return;
    }
    if (
      !close(e.position[0], a.position[0], tolerance) ||
      !close(e.position[1], a.position[1], tolerance)
    ) {
      out.push(`item ${id} position ${e.position} -> ${a.position}`);
    }
    if (!same(e.items, a.items) || e.isOpen !== a.isOpen) {
      out.push(`item ${id} group ${JSON.stringify([e.items, e.isOpen])} -> ${JSON.stringify([a.items, a.isOpen])}`);
    }
  });
  return out;
};

declare global {
  interface Window {
    __kozaneba_snapshot?: () => TSnapshot;
  }
}
