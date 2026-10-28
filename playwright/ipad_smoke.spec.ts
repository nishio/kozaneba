import { test, expect, Page } from "@playwright/test";

// iPad (WebKit) baseline smoke. On the CURRENT main this records WHERE iPad
// touch interaction breaks; as the K10+ work lands, failing cases should turn
// green. See wiki/themes/iPad実機対応調査_2026-06.md.

// Dispatch a native PointerEvent (pointerType:"touch") on the element carrying
// data-testid=<testid>, at the given client coordinates. React listens for
// pointer events at the root, so a bubbling native event drives the app's
// onPointerDown/Move/Up handlers.
async function pointer(
  page: Page,
  testid: string,
  type: "pointerdown" | "pointermove" | "pointerup",
  client: { x: number; y: number },
  opts: { pointerId?: number; buttons?: number } = {}
) {
  await page.evaluate(
    ({ testid, type, client, opts }) => {
      const el = document.querySelector(`[data-testid="${testid}"]`);
      if (!el) throw new Error(`no element for testid ${testid}`);
      const ev = new PointerEvent(type, {
        pointerId: opts.pointerId ?? 1,
        pointerType: "touch",
        isPrimary: (opts.pointerId ?? 1) === 1,
        clientX: client.x,
        clientY: client.y,
        button: 0,
        buttons: opts.buttons ?? (type === "pointerup" ? 0 : 1),
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(ev);
    },
    { testid, type, client, opts }
  );
}

async function centerOf(page: Page, testid: string) {
  const box = await page.locator(`[data-testid="${testid}"]`).boundingBox();
  if (!box) throw new Error(`no box for ${testid}`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

// Single-finger drag: down on the item, move across the canvas, up on canvas.
async function touchDrag(
  page: Page,
  fromTestid: string,
  to: { x: number; y: number }
) {
  const from = await centerOf(page, fromTestid);
  await pointer(page, fromTestid, "pointerdown", from);
  await pointer(page, "ba", "pointermove", { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 });
  await pointer(page, "ba", "pointermove", to);
  await pointer(page, "ba", "pointerup", to);
}

const gl = (page: Page, fn: string) =>
  page.evaluate((fn) => (window as any).movidea.getGlobal()[fn], fn);

// An exception in a pointer handler does not fail a test by itself (the
// pinch-start throw in #61 went unnoticed this way), so collect them.
const pageErrors = new WeakMap<Page, Error[]>();

test.beforeEach(async ({ page }) => {
  const errors: Error[] = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (e) => errors.push(e));
  await page.goto("/#blank");
  await expect(page.locator("#appbar")).toContainText("Kozaneba");
  await expect(page.locator("[data-testid='ba']")).toBeVisible();
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page)?.map((e) => e.message) ?? []).toEqual([]);
});

test("boots on iPad viewport", async ({ page }) => {
  await expect(page.locator("#canvas")).toBeVisible();
  // NOTE: emulated WebKit reports navigator.maxTouchPoints === 0, but touch
  // event support is present; assert the latter instead.
  const touch = await page.evaluate(() => "ontouchstart" in window);
  expect(touch).toBeTruthy();
});

test("creates a kozane and renders it", async ({ page }) => {
  await page.evaluate(() =>
    (window as any).movidea.make_one_kozane({ id: "1", text: "hello", position: [0, 0] })
  );
  await expect(page.locator("[data-testid='1']")).toBeVisible();
});

test("touch-drag moves a kozane", async ({ page }) => {
  await page.evaluate(() =>
    (window as any).movidea.make_one_kozane({ id: "1", text: "A", position: [0, 0] })
  );
  await expect(page.locator("[data-testid='1']")).toBeVisible();
  const before = await page.evaluate(() => (window as any).movidea.getGlobal().itemStore["1"].position);
  const target = await centerOf(page, "ba");
  await touchDrag(page, "1", { x: target.x + 80, y: target.y + 60 });
  const after = await page.evaluate(() => (window as any).movidea.getGlobal().itemStore["1"].position);
  expect(after).not.toEqual(before);
});

test("touch-drag drops a kozane into a group", async ({ page }) => {
  await page.evaluate(() => {
    const m = (window as any).movidea;
    m.make_one_kozane({ id: "1", text: "A", position: [-150, 0] });
    m.make_one_kozane({ id: "2", text: "B", position: [150, 0] });
    m.make_items_into_new_group(["2"], { id: "G2", text: "G2" });
  });
  await expect(page.locator("[data-testid='G2']")).toBeVisible();
  const g = await centerOf(page, "G2");
  await touchDrag(page, "1", g);
  const items = await page.evaluate(() => (window as any).movidea.getGlobal().itemStore["G2"].items);
  expect(items).toContain("1");
});

test("touch-drag drops a kozane into a NESTED group", async ({ page }) => {
  // A(B(C)) nested groups + a root item R; drop R onto the inner group B.
  await page.evaluate(() => {
    const m = (window as any).movidea;
    m.make_one_kozane({ id: "C", text: "C", position: [0, 0] });
    m.make_items_into_new_group(["C"], { id: "B", text: "B" });
    m.make_items_into_new_group(["B"], { id: "A", text: "A" });
    m.make_one_kozane({ id: "R", text: "R", position: [300, 0] });
  });
  await expect(page.locator("[data-testid='B']")).toBeVisible();
  const b = await centerOf(page, "B");
  await touchDrag(page, "R", b);
  const items = await page.evaluate(() => (window as any).movidea.getGlobal().itemStore["B"].items);
  expect(items).toContain("R");
});

test("touch-drag drops a kozane into a CLOSED group", async ({ page }) => {
  await page.evaluate(() => {
    const m = (window as any).movidea;
    m.make_one_kozane({ id: "1", text: "1", position: [0, 0] });
    m.make_items_into_new_group(["1"], { id: "G", text: "G" });
    m.closeGroup("G"); // real DOM so group bounding box is available
    m.make_one_kozane({ id: "R", text: "R", position: [300, 0] });
  });
  await expect(page.locator("[data-testid='G']")).toBeVisible();
  const g = await centerOf(page, "G");
  await touchDrag(page, "R", g);
  const items = await page.evaluate(() => (window as any).movidea.getGlobal().itemStore["G"].items);
  expect(items).toContain("R");
  const isOpen = await page.evaluate(() => (window as any).movidea.getGlobal().itemStore["G"].isOpen);
  expect(isOpen).toBe(false);
});

// Line-label editing via touch double-tap (LineAnnot pointer support, #54 folded
// into this base). Verifies the consolidated line input under real WebKit.
test("double-tap on a line opens the label editor", async ({ page }) => {
  await page.evaluate(() => {
    const m = (window as any).movidea;
    m.make_one_kozane({ id: "A", text: "A", position: [-120, 0] });
    m.make_one_kozane({ id: "B", text: "B", position: [120, 0] });
    m.updateGlobal((g: any) => {
      g.annotations.push({
        type: "line",
        items: ["A", "B"],
        heads: ["none", "none"],
        custom: {},
        is_doubled: false,
      });
    });
  });
  const hit = page.locator("[data-testid='line-label-hit-0-0']");
  // The hit target is a transparent SVG <line> with zero-height geometry bbox,
  // so toBeVisible() reports hidden; it is still interactable. Wait for attach.
  await hit.waitFor({ state: "attached" });
  // Events are dispatched on the element itself; exact coords are irrelevant to
  // the double-tap handler, so use the line's bbox center.
  const c = await centerOf(page, "line-label-hit-0-0");
  // two taps within the double-tap window
  await pointer(page, "line-label-hit-0-0", "pointerdown", c);
  await pointer(page, "line-label-hit-0-0", "pointerup", c);
  await pointer(page, "line-label-hit-0-0", "pointerdown", c);
  await pointer(page, "line-label-hit-0-0", "pointerup", c);
  await expect(page.locator("[data-testid='line-label-editor-0']")).toBeVisible();
});

// Tapping a kozane opens its context menu (no right-click needed) and the menu's
// "edit" opens the edit dialog. Confirms the touch path for the two interactions
// a mouse would use right-click / double-click for. See QUEUE K13 inventory.
test("tap a kozane opens its menu and edit opens the dialog", async ({ page }) => {
  await page.evaluate(() =>
    (window as any).movidea.make_one_kozane({ id: "1", text: "hi", position: [0, 0] })
  );
  await expect(page.locator("[data-testid='1']")).toBeVisible();
  const c = await centerOf(page, "1");
  // a tap: pointer down on the kozane, up at the same spot (no drag)
  await pointer(page, "1", "pointerdown", c);
  await pointer(page, "ba", "pointerup", c);
  const edit = page.locator("[data-testid='kozane-edit']");
  await expect(edit).toBeVisible();
  await edit.click();
  // the edit dialog has a textarea (the menu does not)
  await expect(page.locator("[role='dialog'] textarea").first()).toBeVisible();
});

// Two-finger pinch zooms (K12). Spreading the fingers increases scale.
test("pinch-zoom (two-finger spread) zooms in", async ({ page }) => {
  const scaleBefore = await page.evaluate(() => (window as any).movidea.getGlobal().scale);
  const c = await centerOf(page, "ba");
  await pointer(page, "ba", "pointerdown", { x: c.x - 40, y: c.y }, { pointerId: 1 });
  await pointer(page, "ba", "pointerdown", { x: c.x + 40, y: c.y }, { pointerId: 2 });
  await pointer(page, "ba", "pointermove", { x: c.x - 120, y: c.y }, { pointerId: 1 });
  await pointer(page, "ba", "pointermove", { x: c.x + 120, y: c.y }, { pointerId: 2 });
  await pointer(page, "ba", "pointerup", { x: c.x - 120, y: c.y }, { pointerId: 1 });
  await pointer(page, "ba", "pointerup", { x: c.x + 120, y: c.y }, { pointerId: 2 });
  const scaleAfter = await page.evaluate(() => (window as any).movidea.getGlobal().scale);
  // fingers spread 80px -> 240px => ~3x
  expect(scaleAfter).toBeGreaterThan(scaleBefore * 1.5);
});

// A two-finger drag (both fingers move together, distance ~constant) pans.
test("two-finger drag pans the canvas", async ({ page }) => {
  const before = await page.evaluate(() => {
    const g = (window as any).movidea.getGlobal();
    return { tx: g.trans_x, ty: g.trans_y, scale: g.scale };
  });
  const c = await centerOf(page, "ba");
  await pointer(page, "ba", "pointerdown", { x: c.x - 40, y: c.y }, { pointerId: 1 });
  await pointer(page, "ba", "pointerdown", { x: c.x + 40, y: c.y }, { pointerId: 2 });
  await pointer(page, "ba", "pointermove", { x: c.x - 40 + 60, y: c.y + 40 }, { pointerId: 1 });
  await pointer(page, "ba", "pointermove", { x: c.x + 40 + 60, y: c.y + 40 }, { pointerId: 2 });
  await pointer(page, "ba", "pointerup", { x: c.x - 40 + 60, y: c.y + 40 }, { pointerId: 1 });
  await pointer(page, "ba", "pointerup", { x: c.x + 40 + 60, y: c.y + 40 }, { pointerId: 2 });
  const after = await page.evaluate(() => {
    const g = (window as any).movidea.getGlobal();
    return { tx: g.trans_x, ty: g.trans_y, scale: g.scale };
  });
  expect(after.scale).toBeCloseTo(before.scale, 1); // pan keeps scale ~constant
  expect({ tx: after.tx, ty: after.ty }).not.toEqual({ tx: before.tx, ty: before.ty });
});
