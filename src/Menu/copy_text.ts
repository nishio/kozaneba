import { getGlobal } from "reactn";
import { L1norm, L2norm, V2 } from "../dimension/V2";
import { get_item } from "../Event/get_item";
import { ItemId, TItem } from "../Global/initializeGlobalState";
import { KOZANE_HEIGHT, KOZANE_WIDTH } from "../Kozane/kozane_constants";
import { remove_item_from } from "../utils/remove_item";

const split_head = (items: ItemId[]): [ItemId, ItemId[]] => {
  const car = items[0];
  if (car === undefined) {
    throw new Error("");
  }
  return [car, items.slice(1)];
};

const get_left_top = (items: ItemId[]): ItemId => {
  let [result, cdr] = split_head(items);
  const g = getGlobal();
  const score = (id: ItemId) => {
    return -L1norm(get_item(g, id).position);
  };
  cdr.forEach((x) => {
    if (score(x) > score(result)) {
      result = x;
    }
  });
  return result;
};

// const get_top = (items: ItemId[]): ItemId => {
//   let [result, cdr] = split_head(items);
//   const g = getGlobal();
//   const score = (id: ItemId) => {
//     return -get_item(g, id).position[1];
//   };
//   cdr.forEach((x) => {
//     if (score(x) > score(result)) {
//       result = x;
//     }
//   });
//   return result;
// };

const bound = 1.5; // slightly larger than sqrt(2)
const get_neighbors = ([px, py]: V2, items: ItemId[]): ItemId[] => {
  const g = getGlobal();
  const result = [] as ItemId[];
  const distance = (id: ItemId) => {
    const [x, y] = get_item(g, id).position;
    const dx = x - px;
    const dy = y - py;
    // if (dx < 0 && dy < 0) {
    //   return 1e99; // Do not connect up-left direction
    // } // it cause unnatural cluster split
    return L2norm([dx / KOZANE_WIDTH, dy / KOZANE_HEIGHT]);
  };
  items.forEach((id) => {
    if (distance(id) < bound) {
      result.push(id);
    }
  });
  return result;
};

const get_nearest_neighbors = ([px, py]: V2, items: ItemId[]): ItemId => {
  const g = getGlobal();
  let [result, cdr] = split_head(items);
  const score = (id: ItemId) => {
    const [x, y] = get_item(g, id).position;
    const dx = Math.abs(px - x) - KOZANE_WIDTH;
    const dy = Math.abs(py - y) - KOZANE_HEIGHT;
    let score = 0;
    if (dx < 0 && dy < 0) {
      score = KOZANE_WIDTH + Math.max(-dx, -dy);
    } else if (dx * dy < 0) {
      score = KOZANE_WIDTH - Math.max(dx, dy);
    } else {
      score = -Math.min(dx, dy);
    }
    score -= y / 2;
    return score;
  };
  cdr.forEach((x) => {
    if (score(x) > score(result)) {
      result = x;
    }
  });
  return result;
};

class Buffer {
  last_line: string;
  lines: string[];
  constructor() {
    this.last_line = "";
    this.lines = [];
  }
  push(s: string) {
    this.last_line += s;
  }
  addline(s: string) {
    if (this.last_line !== "") {
      this.newline();
    }
    this.lines.push(s);
  }
  newline(): void {
    this.lines.push(this.last_line);
    this.last_line = "";
  }
  concat(): string {
    return this.lines.join("\n");
  }
}

const push = (item: TItem, out: Buffer) => {
  if (item.type === "kozane") {
    out.push(item.text);
  } else if (item.type === "group") {
    if (!item.isOpen) {
      // closed group is as kozane
      out.push(item.text);
    } else {
      if (item.items.length === 0) {
        return;
      }
      const g_out = new Buffer();
      serialize(item.items, g_out);
      if (item.text !== "") {
        out.addline(item.text);
        g_out.lines.forEach((line) => {
          out.addline("\t" + line);
        });
      } else {
        out.addline(g_out.lines[0]!);
        g_out.lines.slice(1).forEach((line) => {
          out.addline("\t" + line);
        });
      }
    }
  }
};

const get_chain = (items: ItemId[], out: Buffer): [ItemId[], ItemId[]] => {
  const g = getGlobal();
  const result = [] as ItemId[];
  let cur = get_left_top(items);
  let side_chain = new Set() as Set<ItemId>;
  while (1) {
    items = remove_item_from(items, cur);
    side_chain.delete(cur);
    result.push(cur);
    const item = get_item(g, cur);
    console.log(item.text);
    push(item, out);
    const neighbors = get_neighbors(item.position, items);
    if (neighbors.length === 1) {
      cur = neighbors[0]!;
    } else if (neighbors.length === 0) {
      if (side_chain.size === 0) {
        // no neighbors
        // finish
        return [result, items];
      } else {
        console.log("no-neighbor chain break");
        out.newline();
        cur = get_left_top(Array.from(side_chain));
      }
    } else {
      // multiple candidates
      cur = get_nearest_neighbors(item.position, neighbors);
      remove_item_from(neighbors, cur).forEach((x) => side_chain.add(x));
    }
  }
  // eslint-disable-next-line no-unreachable
  return [[], []];
};

export const copy_text = () => {
  let items = getGlobal().selected_items;
  const out = new Buffer();
  serialize(items, out);
  console.log(out.concat());
  navigator.clipboard.writeText(out.concat());
};

const serialize = (items: ItemId[], out: Buffer) => {
  if (items.length === 0) {
    return "";
  }
  while (items.length > 0) {
    let [, new_items] = get_chain(items, out);
    items = new_items;
    console.log("chain break");
    out.newline();
  }
};
// @ts-ignore
window.test = () => {
  const out = new Buffer();
  serialize(getGlobal().drawOrder, out);
  console.log(out.concat());
};
