import { getGlobal } from "reactn";
import { State } from "reactn/default";
import { get_item } from "./get_item";
import { TItemId } from "../Global/TItemId";

// Original O(total items) scan. Used directly for the explicit-state (immer
// draft / mid-mutation) path, where the draft is changing and a cache would be
// unsafe, and as the index builder below.
const find_parent_direct = (target: TItemId, g: State): null | TItemId => {
  let result: null | TItemId = null;
  const visit = (id: TItemId) => {
    const x = get_item(g, id);
    if (x.type === "group") {
      if (x.items.includes(target)) {
        result = id;
      }
      x.items.forEach((id) => visit(id));
    }
  };
  g.drawOrder.forEach((id) => visit(id));
  return result;
};

// Child -> parent index for the no-state (read / render) path. updateGlobal uses
// immer, so any structural change produces new itemStore / drawOrder references;
// we can therefore cache the index and reuse it until either reference changes.
// This turns a render pass (get_global_position for every item) from O(n^2) into
// ~O(n). See wiki/themes/描画性能計測_2026-10.md and QUEUE K15.
let cache: {
  itemStore: State["itemStore"];
  drawOrder: State["drawOrder"];
  parentOf: Map<TItemId, TItemId>;
} | null = null;

const build_index = (g: State): Map<TItemId, TItemId> => {
  const parentOf = new Map<TItemId, TItemId>();
  const visit = (id: TItemId) => {
    const x = get_item(g, id);
    if (x.type === "group") {
      for (const child of x.items) {
        parentOf.set(child, id);
        visit(child);
      }
    }
  };
  g.drawOrder.forEach((id) => visit(id));
  return parentOf;
};

const get_parent_index = (g: State): Map<TItemId, TItemId> => {
  if (
    cache !== null &&
    cache.itemStore === g.itemStore &&
    cache.drawOrder === g.drawOrder
  ) {
    return cache.parentOf;
  }
  const parentOf = build_index(g);
  cache = { itemStore: g.itemStore, drawOrder: g.drawOrder, parentOf };
  return parentOf;
};

// Exposed for tests / explicit invalidation if ever needed.
export const invalidate_parent_index = () => {
  cache = null;
};

export const find_parent = (
  target: TItemId,
  state?: State | undefined
): null | TItemId => {
  if (state !== undefined) {
    // draft / mid-mutation path: scan directly, exactly as before.
    return find_parent_direct(target, state);
  }
  // read / render path: use the reference-validated index.
  return get_parent_index(getGlobal()).get(target) ?? null;
};
