import { getGlobal } from "reactn";
import { bounding_box_to_rect } from "../dimension/bounding_box_to_rect";
import { get_item_bounding_box } from "../dimension/get_bounding_box";
import { L2norm, sub_v2 } from "../dimension/V2";
import { TItemId } from "../Global/TItemId";
import { get_item } from "../utils/get_item";
import { KOZANE_HEIGHT, KOZANE_WIDTH } from "../utils/kozane_constants";

const ADJACENT_RADIUS = KOZANE_HEIGHT / 2;
export const is_adjacent = (a: TItemId, b: TItemId): boolean => {
  const g = getGlobal();
  const ba = get_item_bounding_box(a);
  const bb = get_item_bounding_box(b);
  const pa = get_item(g, a).position;
  const pb = get_item(g, b).position;
  const delta = sub_v2(pa, pb);
  let [dx, dy] = delta;
  const ra = bounding_box_to_rect(ba);
  const rb = bounding_box_to_rect(bb);
  const pad_x = (ra.width + rb.width) / 2;
  const pad_y = (ra.height + rb.height) / 2;
  dx = (Math.max(0, Math.abs(dx) - pad_x) / KOZANE_WIDTH) * KOZANE_HEIGHT;
  dy = Math.max(0, Math.abs(dy) - pad_y);
  if (L2norm([dx, dy]) < ADJACENT_RADIUS) {
    return true;
  }
  return false;
};

const split_head = (items: TItemId[]): [TItemId, TItemId[]] => {
  const car = items[0];
  if (car === undefined) {
    throw new Error("");
  }
  return [car, items.slice(1)];
};

export const find_clusters = (items: TItemId[]): TItemId[][] => {
  const visited = {} as { [key: string]: boolean };
  const result = [];
  const visit = (current: TItemId, cluster: TItemId[]) => {
    cluster.push(current);
    visited[current] = true;
    items.forEach((next) => {
      if (visited[next] !== true && is_adjacent(current, next)) {
        visit(next, cluster);
      }
    });
  };
  items = sort_items_from_left_top(items);
  while (items.length > 0) {
    const [car, cdr] = split_head(items);
    items = cdr;
    if (visited[car] === true) {
      continue;
    }
    const cluster = [] as TItemId[];
    result.push(cluster);
    visit(car, cluster);
  }
  return result;
};

export const is_chainable = (a: TItemId, b: TItemId): boolean => {
  const g = getGlobal();
  const pa = get_item(g, a).position;
  const pb = get_item(g, b).position;
  const delta = sub_v2(pb, pa);
  let [dx, dy] = delta;
  if (dx < 0 && dy < 0) {
    return false;
  }
  return is_adjacent(a, b);
};

const get_sorted = (items: TItemId[], get_cost: (id: TItemId) => number) => {
  return items
    .map((id) => [get_cost(id), id] as [number, TItemId])
    .sort((a, b) => a[0] - b[0])
    .map(([_cost, id]) => id);
};

const sort_items_from_left_top = (items: TItemId[]): TItemId[] => {
  const g = getGlobal();
  const get_cost = (id: TItemId) => {
    const item = get_item(g, id);
    const cost = item.position[0] + item.position[1];
    return cost;
  };

  return get_sorted(items, get_cost);
};

const sort_items_for_next_item = (items: TItemId[]): TItemId[] => {
  const g = getGlobal();
  const get_cost = (id: TItemId) => {
    const item = get_item(g, id);
    const cost = item.position[0] + item.position[1] * 4;
    console.log(item.text, cost);
    return cost;
  };

  return get_sorted(items, get_cost);
};

export const cluster_to_chain = (items: TItemId[]): TItemId[][] => {
  const visited = {} as { [key: string]: boolean };
  const result = [] as TItemId[][];

  const g = getGlobal();

  const visit = (current: TItemId, chain: TItemId[]) => {
    console.log("visit", get_item(g, current).text);
    chain.push(current);
    visited[current] = true;
    const next_items = [] as TItemId[];
    items.forEach((next) => {
      if (is_chainable(current, next)) {
        next_items.push(next);
      }
    });
    console.log("next_items", next_items);
    sort_items_for_next_item(next_items).forEach((next) => {
      console.log("next", get_item(g, next).text);
      if (visited[next] !== true) {
        visit(next, chain);
      }
    });
  };

  sort_items_from_left_top(items).forEach((start) => {
    console.log("start", get_item(g, start).text);
    if (visited[start] === true) {
      return;
    }
    const chain = [] as TItemId[];
    result.push(chain);
    visit(start, chain);
  });
  return result;
};

export const items_to_lines = (items: TItemId[]): string[] => {
  const result = [] as string[];
  const g = getGlobal();
  find_clusters(items).forEach((cluster) => {
    // result.push("** start cluster");
    cluster_to_chain(cluster).forEach((chain) => {
      // result.push("* start chain");
      chain.forEach((id) => {
        const item = get_item(g, id);
        if (item.type === "kozane") {
          result.push(item.text);
        } else if (item.type === "scrapbox") {
          result.push(item.text);
        } else if (item.type === "gyazo") {
          result.push("(image)");
        } else if (item.type === "group") {
          if (item.isOpen || item.text === "") {
            items_to_lines(item.items).forEach((line) => {
              result.push(line);
            });
          } else {
            result.push(item.text);
          }
        }
      });
    });
  });
  return result;
};

export const copy_text = () => {
  const ret = items_to_lines(getGlobal().selected_items).join("\n");
  console.log(ret);
  navigator.clipboard.writeText(ret);
};

// @ts-ignore
window.copy_text = () => {
  console.log(items_to_lines(getGlobal().drawOrder).join("\n"));
};
