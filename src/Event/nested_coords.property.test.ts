import fc from "fast-check";
import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TGroupItem } from "../Global/TGroupItem";
import { TItem } from "../Global/TItem";
import { TItemId } from "../Global/TItemId";
import { TWorldCoord } from "../dimension/world_to_screen";
import { get_middle_point } from "../Canvas/Annotation/get_middle_point";
import { get_global_position } from "../dimension/get_global_position";
import { get_group_bounding_box } from "../dimension/get_group_bounding_box";

// Property-based checks (fast-check) of the world-coordinate invariants of
// moving items between groups, on random nested boards (groups up to 3 deep),
// through the real handlers and the real global state, like
// nested_drag_invariants.test.ts does for a few fixed boards.
//
// World position of an item = the sum of the stored (local) positions along
// its parent chain (`absolute` below, written independently of the code under
// test). Closed groups draw their descendants at the group's own position, but
// keep the stored positions, so opening the group again shows them where they
// were; the invariants below are about the stored world position.
//
// What `delta` means (read from the code): onGenericMouseDown stores
// dragstart = mouse_world - item.position (the item's LOCAL position), and
// get_delta returns mouse_world_now - dragstart. So for an item drag, `delta`
// is "the local position plus the world movement m" -- the drop position in
// the frame of the item's current parent. For a selection drag,
// onSelectionMouseDown stores dragstart = mouse_world, so `delta` is just m.
//
// Tolerance: positions are doubles in [-2000, 2000], each operation is a few
// additions and halvings over at most 4 levels, so the error is ~1e-12. We
// allow 1e-9.

vi.mock("./fast_drag_manager", () => ({ reset_target: vi.fn() }));
vi.mock("../initSentry", () => ({ Sentry: { captureMessage: vi.fn() } }));
vi.mock("../API/redraw", () => ({ redraw: vi.fn() }));
vi.mock("../utils/close_menu", () => ({ close_menu: vi.fn() }));

import { drag_drop_item } from "./drag_drop_item";
import { drag_drop_item_into_group } from "./drag_drop_item_into_group";
import { drag_drop_selection_into_group } from "./drag_drop_selection_into_group";
import { ungroup } from "../Menu/ungroup";
import { normalize_group_position } from "../utils/normalize_group_position";

const PARAMS = { seed: 20261125, numRuns: 200 };
const TOL = 1e-9;
const MAX_DEPTH = 3;

const id = (v: string) => v as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

// ---------------------------------------------------------------- boards

type Spec = {
  isGroup: boolean;
  parent: number; // 0 = root, k = the k-th group created so far (mod)
  pos: [number, number];
  titled: boolean;
  open: boolean;
};

const coord = fc.double({ min: -2000, max: 2000, noNaN: true });
const specArb = (opts: { allowClosed: boolean }) =>
  fc.record({
    isGroup: fc.boolean(),
    parent: fc.nat(),
    pos: fc.tuple(coord, coord),
    titled: fc.boolean(),
    open: opts.allowClosed ? fc.boolean() : fc.constant(true),
  });
const boardArb = (opts = { allowClosed: false }) =>
  fc.array(specArb(opts), { minLength: 2, maxLength: 10 });

type Board = { ids: TItemId[]; groups: TItemId[] };

const buildBoard = (specs: Spec[]): Board => {
  const itemStore: { [k: string]: TItem } = {};
  const drawOrder: TItemId[] = [];
  const groups: TItemId[] = [];
  const depth = new Map<TItemId, number>();
  const ids: TItemId[] = [];
  specs.forEach((s, i) => {
    const me = id((s.isGroup ? "G" : "K") + i);
    ids.push(me);
    let parent: TItemId | null = null;
    const k = s.parent % (groups.length + 1);
    if (k > 0) {
      const cand = groups[k - 1]!;
      if (depth.get(cand)! < MAX_DEPTH) parent = cand;
    }
    depth.set(me, parent === null ? 1 : depth.get(parent)! + 1);
    if (s.isGroup) {
      itemStore[me] = {
        type: "group",
        id: me,
        text: s.titled ? "title " + me : "",
        position: world(s.pos[0], s.pos[1]),
        items: [],
        scale: 1,
        isOpen: s.open,
      };
      groups.push(me);
    } else {
      itemStore[me] = {
        type: "kozane",
        id: me,
        text: me,
        position: world(s.pos[0], s.pos[1]),
        scale: 1,
      };
    }
    if (parent === null) drawOrder.push(me);
    else (itemStore[parent] as TGroupItem).items.push(me);
  });
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    drawOrder,
    itemStore,
    selected_items: [],
    selectionRange: { top: 0, left: 0, width: 0, height: 0 },
  } as unknown as State);
  return { ids, groups };
};

// ------------------------------------------------- independent reference

const parentMap = (state: State) => {
  const parent = new Map<TItemId, TItemId | null>();
  const visit = (ids: TItemId[], p: TItemId | null) => {
    for (const x of ids) {
      parent.set(x, p);
      const item = state.itemStore[x];
      if (item?.type === "group") visit(item.items, x);
    }
  };
  visit(state.drawOrder, null);
  return parent;
};

const absolute = (state: State, target: TItemId): TWorldCoord => {
  const parent = parentMap(state);
  if (!parent.has(target)) throw new Error(`not on the board: ${target}`);
  let x = 0;
  let y = 0;
  let cur: TItemId | null = target;
  while (cur !== null) {
    const p = state.itemStore[cur]!.position;
    x += p[0];
    y += p[1];
    cur = parent.get(cur)!;
  }
  return world(x, y);
};

const onBoard = (state: State) => [...parentMap(state).keys()];

const subtree = (state: State, root: TItemId): Set<TItemId> => {
  const out = new Set<TItemId>([root]);
  const visit = (x: TItemId) => {
    const item = state.itemStore[x];
    if (item?.type === "group") item.items.forEach((c) => (out.add(c), visit(c)));
  };
  visit(root);
  return out;
};

const snapshot = (state: State) =>
  new Map(onBoard(state).map((x) => [x, absolute(state, x)] as const));

const close = (a: TWorldCoord, b: TWorldCoord) =>
  Math.abs(a[0] - b[0]) <= TOL * (1 + Math.abs(b[0])) &&
  Math.abs(a[1] - b[1]) <= TOL * (1 + Math.abs(b[1]));

// every item still on the board is at (before + shift(item)) in world coords
const expectWorldKept = (
  before: Map<TItemId, TWorldCoord>,
  shift: (x: TItemId) => [number, number],
  skip: (x: TItemId) => boolean = () => false
) => {
  const state = getGlobal();
  for (const x of onBoard(state)) {
    if (skip(x)) continue;
    const b = before.get(x);
    if (b === undefined) throw new Error(`item appeared: ${x}`);
    const [dx, dy] = shift(x);
    const want = world(b[0] + dx, b[1] + dy);
    const got = absolute(state, x);
    if (!close(got, want)) {
      throw new Error(
        `${x} moved in world coords: want ${JSON.stringify(want)}, got ${JSON.stringify(got)}`
      );
    }
  }
};

const isNormalized = (state: State, gid: TItemId) => {
  const g = state.itemStore[gid] as TGroupItem;
  if (g.items.length === 0) return true;
  const m = get_middle_point(g.items.map((c) => state.itemStore[c]!.position));
  return Math.abs(m[0]) <= TOL * 2000 && Math.abs(m[1]) <= TOL * 2000;
};

const expectNormalized = (state: State, gid: TItemId) => {
  if (!isNormalized(state, gid)) {
    const g = state.itemStore[gid] as TGroupItem;
    throw new Error(
      `${gid} is not centered on its children: ${JSON.stringify(
        g.items.map((c) => [c, state.itemStore[c]!.position])
      )}`
    );
  }
};

const depthOf = (state: State, x: TItemId) => {
  const parent = parentMap(state);
  let d = 0;
  for (let c: TItemId | null = x; c !== null; c = parent.get(c)!) d++;
  return d;
};

// Centers every group on its children. Deepest first, one level per call, so
// it does not rely on normalize_group_position walking up (before #145, that
// walk was lost when there was no draft; see the ancestors case below).
const normalizeAllDeepestFirst = () => {
  const s = getGlobal();
  const groups = onBoard(s).filter((x) => s.itemStore[x]!.type === "group");
  groups.sort((a, b) => depthOf(s, b) - depthOf(s, a));
  groups.forEach((gid) => normalize_group_position(gid));
};

const isGroup = (state: State, x: TItemId) => state.itemStore[x]?.type === "group";

const ancestorsAndSelf = (state: State, x: TItemId) => {
  const parent = parentMap(state);
  const out: TItemId[] = [];
  for (let c: TItemId | null = x; c !== null; c = parent.get(c)!) out.push(c);
  return out;
};

const moveArb = fc.tuple(
  fc.double({ min: -500, max: 500, noNaN: true }),
  fc.double({ min: -500, max: 500, noNaN: true })
);

// ---------------------------------------------------------------- tests
//
// Groups that get re-centered (normalize_group_position) move their own
// anchor by design while their children keep their world position, so the
// world-position checks below skip groups that are not part of the moved
// subtree. Whether the anchors end up centered is checked separately.

describe("moving items between groups keeps world positions (fast-check)", () => {
  test("drop onto the canvas (drag_drop_item): the item and its subtree move by m, nothing else moves", () => {
    fc.assert(
      fc.property(boardArb({ allowClosed: true }), fc.nat(), moveArb, (specs, ti, m) => {
        const { ids } = buildBoard(specs);
        const target = ids[ti % ids.length]!;
        const s0 = getGlobal();
        const before = snapshot(s0);
        const moving = subtree(s0, target);
        const p = s0.itemStore[target]!.position;
        drag_drop_item(getGlobal(), world(p[0] + m[0], p[1] + m[1]), target);
        expect(getGlobal().drawOrder).toContain(target);
        expectWorldKept(
          before,
          (x) => (moving.has(x) ? m : [0, 0]),
          (x) => isGroup(s0, x) && !moving.has(x)
        );
      }),
      PARAMS
    );
  });

  test("drop into another group (drag_drop_item_into_group): the item and its subtree move by m, nothing else moves", () => {
    fc.assert(
      fc.property(boardArb({ allowClosed: true }), fc.nat(), fc.nat(), moveArb, (specs, ti, gi, m) => {
        const { ids, groups } = buildBoard(specs);
        fc.pre(groups.length > 0);
        const target = ids[ti % ids.length]!;
        const gid = groups[gi % groups.length]!;
        const s0 = getGlobal();
        const moving = subtree(s0, target);
        fc.pre(!moving.has(gid)); // filtered by onCanvasMouseUp, guarded inside
        const oldParent = parentMap(s0).get(target) ?? null;
        fc.pre(oldParent !== gid); // same group: K2, tested below
        // into an ancestor of the old parent: tested below
        fc.pre(oldParent === null || !ancestorsAndSelf(s0, oldParent).includes(gid));
        const before = snapshot(s0);
        const p = s0.itemStore[target]!.position;
        drag_drop_item_into_group(gid, world(p[0] + m[0], p[1] + m[1]), target);
        expect(parentMap(getGlobal()).get(target)).toBe(gid);
        expectWorldKept(
          before,
          (x) => (moving.has(x) ? m : [0, 0]),
          (x) => isGroup(s0, x) && !moving.has(x)
        );
      }),
      PARAMS
    );
  });

  // K2, fixed in #145 (also pinned in nested_drag_invariants.test.ts): dropping an
  // item into the group it is already in shifts it by the group's
  // re-centering offset. Shrunk counterexample (seed 20261125): root group
  // G0 (0,0) > K1 (0,-1e-9); drop K1 into G0 with m = 0: K1 moves by
  // (0,-1e-9), its share of G0's re-centering.
  test("drop into the group the item is already in keeps world positions (K2, fixed in #145)", () => {
    fc.assert(
      fc.property(boardArb(), fc.nat(), moveArb, (specs, ti, m) => {
        const { ids } = buildBoard(specs);
        const target = ids[ti % ids.length]!;
        const s0 = getGlobal();
        const gid = parentMap(s0).get(target);
        fc.pre(gid !== null && gid !== undefined);
        const before = snapshot(s0);
        const moving = subtree(s0, target);
        const p = s0.itemStore[target]!.position;
        drag_drop_item_into_group(gid!, world(p[0] + m[0], p[1] + m[1]), target);
        expectWorldKept(
          before,
          (x) => (moving.has(x) ? m : [0, 0]),
          (x) => isGroup(s0, x) && !moving.has(x)
        );
      }),
      PARAMS
    );
  });

  // Fixed in #145 (a sibling of K2): dropping an item into an ANCESTOR of its current
  // group, e.g. a kozane dragged out of an inner group B onto the outer group
  // A around it. drag_drop_item_into_group pushes the target into A, then
  // re-centers the old parent B with the draft -- and that call walks up and
  // re-centers A too, while the target still holds its old position (local
  // to B). The later `target.position = position` throws away the target's
  // share of A's re-centering, so the target lands off by that shift.
  // The code comment only considered the case where B was removed.
  // Shrunk counterexample (seed 20261125): G0 (0,0) > G1 (0,0) > [K5
  // (2e-9,0), K7 (0,0)]; drop K7 into G0 with m = 0: K7 moves, by its share
  // of G0's re-centering computed with K7 at its stale position. See the
  // minimal case below for one with visible numbers (50px).
  test("drop into an ancestor of the item's group keeps world positions (fixed in #145)", () => {
    fc.assert(
      fc.property(boardArb({ allowClosed: true }), fc.nat(), fc.nat(), moveArb, (specs, ti, gi, m) => {
        const { ids } = buildBoard(specs);
        const s0 = getGlobal();
        const target = ids[ti % ids.length]!;
        const oldParent = parentMap(s0).get(target) ?? null;
        fc.pre(oldParent !== null);
        const above = ancestorsAndSelf(s0, oldParent!).slice(1);
        fc.pre(above.length > 0);
        const gid = above[gi % above.length]!;
        const moving = subtree(s0, target);
        const before = snapshot(s0);
        const p = s0.itemStore[target]!.position;
        drag_drop_item_into_group(gid, world(p[0] + m[0], p[1] + m[1]), target);
        expectWorldKept(
          before,
          (x) => (moving.has(x) ? m : [0, 0]),
          (x) => isGroup(s0, x) && !moving.has(x)
        );
      }),
      PARAMS
    );
  });

  test("ungroup keeps the world position of every item", () => {
    fc.assert(
      fc.property(boardArb({ allowClosed: true }), fc.nat(), (specs, gi) => {
        const { groups } = buildBoard(specs);
        fc.pre(groups.length > 0);
        const gid = groups[gi % groups.length]!;
        const before = snapshot(getGlobal());
        ungroup(gid);
        // a titled group stays, empty, at its old box corner
        expectWorldKept(before, () => [0, 0], (x) => x === gid);
      }),
      PARAMS
    );
  });

  test("drop a selection into a ROOT group: the selection moves by m, nothing else moves", () => {
    fc.assert(
      fc.property(boardArb(), fc.nat(), fc.nat(), moveArb, (specs, gi, sel, m) => {
        buildBoard(specs);
        const s0 = getGlobal();
        const rootGroups = s0.drawOrder.filter((x) => isGroup(s0, x));
        fc.pre(rootGroups.length > 0);
        const gid = rootGroups[gi % rootGroups.length]!;
        // a selection is made of root items (finish_selecting walks drawOrder)
        const roots = s0.drawOrder.filter((x, i) => (sel >> i) & 1 && x !== gid);
        fc.pre(roots.length > 0);
        const moving = new Set(roots.flatMap((r) => [...subtree(s0, r)]));
        const before = snapshot(s0);
        setGlobal({ selected_items: roots, is_selected: true });
        drag_drop_selection_into_group(gid, world(m[0], m[1]));
        expectWorldKept(
          before,
          (x) => (moving.has(x) ? m : [0, 0]),
          (x) => isGroup(s0, x) && !moving.has(x)
        );
      }),
      PARAMS
    );
  });

  // Fixed in #145. Was: drag_drop_selection_into_group converts each selected (root) item
  // into the group's frame by subtracting only the group's own LOCAL
  // position, not the offset of the whole parent chain
  // (get_total_offset_of_parents). Dropping a selection into a group that is
  // inside another group puts every selected item off by the outer groups'
  // positions. Shrunk counterexample (seed 20261125): G0 (1e-9,0) > G1
  // (0,0), empty; root K2 (0,0); select K2 and drop it into G1 with m = 0:
  // K2 lands at (1e-9,0), off by G0's position. Minimal case below.
  test("drop a selection into a NESTED group: the selection moves by m (fixed in #145)", () => {
    fc.assert(
      fc.property(boardArb(), fc.nat(), fc.nat(), moveArb, (specs, gi, sel, m) => {
        const { groups } = buildBoard(specs);
        const s0 = getGlobal();
        const nested = groups.filter((x) => depthOf(s0, x) >= 2);
        fc.pre(nested.length > 0);
        const gid = nested[gi % nested.length]!;
        const roots = s0.drawOrder.filter((_, i) => (sel >> i) & 1);
        fc.pre(roots.length > 0);
        fc.pre(roots.every((r) => !subtree(s0, r).has(gid)));
        const moving = new Set(roots.flatMap((r) => [...subtree(s0, r)]));
        const before = snapshot(s0);
        setGlobal({ selected_items: roots, is_selected: true });
        drag_drop_selection_into_group(gid, world(m[0], m[1]));
        expectWorldKept(
          before,
          (x) => (moving.has(x) ? m : [0, 0]),
          (x) => isGroup(s0, x) && !moving.has(x)
        );
      }),
      PARAMS
    );
  });
});

describe("re-centering groups (normalize_group_position, fast-check)", () => {
  test("normalize_group_position keeps every item's world position except the anchors of the group and its ancestors", () => {
    fc.assert(
      fc.property(boardArb({ allowClosed: true }), fc.nat(), (specs, gi) => {
        const { groups } = buildBoard(specs);
        fc.pre(groups.length > 0);
        const gid = groups[gi % groups.length]!;
        const s0 = getGlobal();
        const before = snapshot(s0);
        const anchors = new Set(ancestorsAndSelf(s0, gid));
        normalize_group_position(gid);
        expectWorldKept(before, () => [0, 0], (x) => anchors.has(x));
      }),
      PARAMS
    );
  });

  test("normalizing every group, deepest first, centers all of them and keeps every kozane (depth 2-3)", () => {
    fc.assert(
      fc.property(boardArb({ allowClosed: true }), (specs) => {
        const { groups } = buildBoard(specs);
        const s0 = getGlobal();
        const before = snapshot(s0);
        normalizeAllDeepestFirst();
        expectWorldKept(before, () => [0, 0], (x) => isGroup(s0, x));
        const s1 = getGlobal();
        for (const gid of groups) expectNormalized(s1, gid);
      }),
      PARAMS
    );
  });

  // Fixed in #145. Was: normalize_group_position(gid) without a draft centers gid but not
  // its ancestors. It recurses with `normalize_group_position(parent, draft)`
  // where `draft` is still undefined, so the recursive call runs a second
  // updateGlobal inside the first one's producer: it reads the global state
  // from before the outer update (gid not yet moved) and its result is then
  // overwritten by the outer update. The walk up ("normalize_group_position
  // also normalize its parents", ba4f945) never happens on this path, which
  // is the path drag_drop_item_into_group, drag_drop_selection_into_group,
  // make_items_into_new_group and the open/close menu take. Kozane world
  // positions are not affected (the lost update is all-or-nothing).
  // Shrunk counterexample (seed 20261125): G0 (0,0) > G1 (-2e-6,0) > K3
  // (0,0); normalize G1: G1 is already centered on K3, and G0, which is not
  // centered on G1, is left as it is.
  test("normalize_group_position centers the group AND its ancestors (fixed in #145)", () => {
    fc.assert(
      fc.property(boardArb({ allowClosed: true }), fc.nat(), (specs, gi) => {
        const { groups } = buildBoard(specs);
        const s0 = getGlobal();
        const nonEmpty = groups.filter((x) => (s0.itemStore[x] as TGroupItem).items.length > 0);
        fc.pre(nonEmpty.length > 0);
        const gid = nonEmpty[gi % nonEmpty.length]!;
        const anchors = ancestorsAndSelf(s0, gid);
        normalize_group_position(gid);
        const s1 = getGlobal();
        for (const x of anchors) expectNormalized(s1, x);
      }),
      PARAMS
    );
  });

  // #137 review: "when the previous parent is removed, the surviving
  // ancestor is not normalized". On a board where every group is centered,
  // a drop into another group should leave every group centered.
  // Before #145 it did not, for two reasons (both reproduced as minimal cases
  // below):
  //   (1) the ancestor case above (fixed in #145): the destination's ancestors are not
  //       re-centered,
  //   (2) the #137 review case: when the old parent was removed, the nearest
  //       surviving group (whose children changed) is not re-centered.
  // Kozanes do not move (the world-position property above holds); what is
  // off is the group's anchor, see the #137 minimal cases below.
  // fast-check (seed 20261125) shrinks this to a 2-deep board with 1e-6
  // sized positions; the minimal cases below show each reason with visible
  // numbers.
  test("drop into another group keeps every group centered on its children (fixed in #145)", () => {
    fc.assert(
      fc.property(boardArb(), fc.nat(), fc.nat(), moveArb, (specs, ti, gi, m) => {
        const { ids, groups } = buildBoard(specs);
        fc.pre(groups.length > 0);
        normalizeAllDeepestFirst();
        const s0 = getGlobal();
        const live = ids.filter((x) => s0.itemStore[x] !== undefined);
        const target = live[ti % live.length]!;
        const gid = groups[gi % groups.length]!;
        fc.pre(!subtree(s0, target).has(gid));
        fc.pre(parentMap(s0).get(target) !== gid);
        const p = s0.itemStore[target]!.position;
        drag_drop_item_into_group(gid, world(p[0] + m[0], p[1] + m[1]), target);
        const s1 = getGlobal();
        for (const x of onBoard(s1)) if (isGroup(s1, x)) expectNormalized(s1, x);
      }),
      PARAMS
    );
  });

  test("drop onto the canvas keeps every group centered on its children", () => {
    // drag_drop_item re-centers the surviving old parent inside its own
    // update (with the draft), so the walk up works on this path.
    fc.assert(
      fc.property(boardArb(), fc.nat(), moveArb, (specs, ti, m) => {
        const { ids } = buildBoard(specs);
        normalizeAllDeepestFirst();
        const s0 = getGlobal();
        const live = ids.filter((x) => s0.itemStore[x] !== undefined);
        const target = live[ti % live.length]!;
        const p = s0.itemStore[target]!.position;
        drag_drop_item(getGlobal(), world(p[0] + m[0], p[1] + m[1]), target);
        const s1 = getGlobal();
        for (const x of onBoard(s1)) if (isGroup(s1, x)) expectNormalized(s1, x);
      }),
      PARAMS
    );
  });
});

describe("closed groups (fast-check)", () => {
  // A closed group is drawn as one box centered on its own anchor
  // (calc_closed_style), and get_global_position puts every hidden item at
  // that anchor. drag_drop_item_into_group re-centers the destination on its
  // children, now including the dropped item, so a closed destination's box
  // jumps toward the drop point by (spread of the children)/2. Kozanes keep
  // their stored world position (the property above holds), so opening the
  // group shows them where they were; only the closed box moves.
  // Whether this is wanted is for the PR to decide (it is how open groups
  // behave too, where the box follows the children).
  // Shrunk counterexample (seed 20261125): root closed G1 (0,0), empty; root
  // K0 (0,-1e-9); drop K0 into G1 with m = 0: the closed box moves to K0 (an
  // empty closed group takes the dropped item's position; one with children
  // moves by half the change of their spread).
  test.fails("drop into a CLOSED group keeps the closed box where it is drawn (pinned: it moves)", () => {
    fc.assert(
      fc.property(boardArb({ allowClosed: true }), fc.nat(), fc.nat(), moveArb, (specs, ti, gi, m) => {
        const { ids } = buildBoard(specs);
        const s0 = getGlobal();
        const closedRoots = s0.drawOrder.filter(
          (x) => isGroup(s0, x) && !(s0.itemStore[x] as TGroupItem).isOpen
        );
        fc.pre(closedRoots.length > 0);
        const gid = closedRoots[gi % closedRoots.length]!;
        const target = ids[ti % ids.length]!;
        fc.pre(s0.drawOrder.includes(target) && target !== gid);
        const anchor = absolute(s0, gid);
        const p = s0.itemStore[target]!.position;
        drag_drop_item_into_group(gid, world(p[0] + m[0], p[1] + m[1]), target);
        const after = absolute(getGlobal(), gid);
        if (!close(after, anchor)) {
          throw new Error(`closed ${gid} moved: ${JSON.stringify(anchor)} -> ${JSON.stringify(after)}`);
        }
      }),
      PARAMS
    );
  });
});

// ------------------------------------------------- minimal cases (plain)
//
// The counterexamples fast-check shrinks to have 1e-9 sized numbers; these
// are the same shapes with numbers one can see on screen.

const kz = (v: string, x: number, y: number): TItem => ({
  type: "kozane",
  id: id(v),
  text: v,
  position: world(x, y),
  scale: 1,
});
const gr = (v: string, x: number, y: number, items: string[], text = "", isOpen = true): TItem => ({
  type: "group",
  id: id(v),
  text,
  position: world(x, y),
  items: items.map(id),
  scale: 1,
  isOpen,
});
const setBoard = (drawOrder: string[], items: TItem[]) =>
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    drawOrder: drawOrder.map(id),
    itemStore: Object.fromEntries(items.map((x) => [x.id, x])),
    selected_items: [],
    selectionRange: { top: 0, left: 0, width: 0, height: 0 },
  } as unknown as State);

describe("minimal cases", () => {
  // A (200,0) > [ B (-200,0) > [ x (-100,0), y (100,0) ], z (200,0) ]
  // world: x = -100, y = 100, z = 400; every group centered.
  const nestedAB = () =>
    setBoard(
      ["A"],
      [
        gr("A", 200, 0, ["B", "z"], "A"),
        gr("B", -200, 0, ["x", "y"], "B"),
        kz("x", -100, 0),
        kz("y", 100, 0),
        kz("z", 200, 0),
      ]
    );

  test("fixed in #145: x dragged out of B and dropped on the outer group A stays where it was dropped", () => {
    nestedAB();
    // no movement: delta is x's local position
    drag_drop_item_into_group(id("A"), world(-100, 0), id("x"));
    // actual: (-50, 0) -- x jumps 50px right
    expect(absolute(getGlobal(), id("x"))).toEqual(world(-100, 0));
  });

  test("fixed in #145: a selection dropped into a nested group stays where it was dropped", () => {
    // A (300,200) > B (0,0) > k (0,0); r at the root
    setBoard(["A", "r"], [gr("A", 300, 200, ["B"], "A"), gr("B", 0, 0, ["k"], "B"), kz("k", 0, 0), kz("r", 1000, 0)]);
    setGlobal({ selected_items: [id("r")], is_selected: true });
    drag_drop_selection_into_group(id("B"), world(0, 0));
    // actual: (1300, 200) -- off by A's position
    expect(absolute(getGlobal(), id("r"))).toEqual(world(1000, 0));
  });

  test("fixed in #145: normalize_group_position re-centers the ancestors too", () => {
    // A (0,0) > B (0,0) > [ k1 (0,0), k2 (100,0) ]; B is not centered
    setBoard(["A"], [gr("A", 0, 0, ["B"]), gr("B", 0, 0, ["k1", "k2"]), kz("k1", 0, 0), kz("k2", 100, 0)]);
    normalize_group_position(id("B"));
    const s = getGlobal();
    expect(s.itemStore.B!.position).toEqual(world(0, 0)); // actual (50, 0)
    expect(s.itemStore.A!.position).toEqual(world(50, 0)); // actual (0, 0)
  });

  // #137 review case. A (0,0) > [ P (-200,0, untitled) > t (0,0), z (200,0) ],
  // G (1000,0) > w (0,0). Every group centered. Drop t into G: P is left
  // empty and untitled, so it is removed, and A (the survivor) keeps its
  // anchor at 0 although its only child z is at 200.
  const review137 = () =>
    setBoard(
      ["A", "G"],
      [
        gr("A", 0, 0, ["P", "z"], "A"),
        gr("P", -200, 0, ["t"]),
        kz("t", 0, 0),
        kz("z", 200, 0),
        gr("G", 1000, 0, ["w"], "G"),
        kz("w", 0, 0),
      ]
    );

  test("#137 review: nothing moves in world coordinates", () => {
    review137();
    drag_drop_item_into_group(id("G"), world(0, 0), id("t"));
    const s = getGlobal();
    expect(s.itemStore.P).toBeUndefined();
    expect(absolute(s, id("t"))).toEqual(world(-200, 0));
    expect(absolute(s, id("z"))).toEqual(world(200, 0));
  });

  test("#137 review (fixed in #145): the surviving group is re-centered on its children", () => {
    review137();
    drag_drop_item_into_group(id("G"), world(0, 0), id("t"));
    expect(getGlobal().itemStore.A!.position).toEqual(world(200, 0)); // actual (0, 0)
  });

  test("#137 review (what it looks like, fixed in #145): the anchor lines aim at stays inside the group's box", () => {
    // A line to a group is drawn from get_global_position(group) to the
    // middle of the line, cut at the group's box (LineAnnot +
    // get_box_line_crosspoint). When the anchor is outside the box,
    // get_box_line_crosspoint returns the anchor itself, so the line ends in
    // empty space next to the group.
    review137();
    drag_drop_item_into_group(id("G"), world(0, 0), id("t"));
    const s = getGlobal();
    const [ax, ay] = get_global_position(id("A"), s);
    const b = get_group_bounding_box(s.itemStore.A as TGroupItem);
    // actual: anchor x = 0, box from x = 79 to x = 321
    expect(b.left <= ax && ax <= b.right && b.top <= ay && ay <= b.bottom).toBe(true);
  });
});
