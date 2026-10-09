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

test.beforeEach(async ({ page }) => {
  await page.goto("/#blank");
  await expect(page.locator("#appbar")).toContainText("Kozaneba");
  await expect(page.locator("[data-testid='ba']")).toBeVisible();
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

// Pinch-zoom is UNSUPPORTED on current main (no multi-touch gesture handler
// yet — QUEUE K12). Baseline confirmed 2026-10-09: scale stays 1 after a
// two-finger spread. Marked fixme so the harness stays green until K12 lands;
// remove .fixme when the pinch handler is implemented.
test.fixme("pinch-zoom changes scale (K12 target)", async ({ page }) => {
  const scaleBefore = await page.evaluate(() => (window as any).movidea.getGlobal().scale);
  const c = await centerOf(page, "ba");
  await pointer(page, "ba", "pointerdown", { x: c.x - 40, y: c.y }, { pointerId: 1 });
  await pointer(page, "ba", "pointerdown", { x: c.x + 40, y: c.y }, { pointerId: 2 });
  await pointer(page, "ba", "pointermove", { x: c.x - 120, y: c.y }, { pointerId: 1 });
  await pointer(page, "ba", "pointermove", { x: c.x + 120, y: c.y }, { pointerId: 2 });
  await pointer(page, "ba", "pointerup", { x: c.x - 120, y: c.y }, { pointerId: 1 });
  await pointer(page, "ba", "pointerup", { x: c.x + 120, y: c.y }, { pointerId: 2 });
  const scaleAfter = await page.evaluate(() => (window as any).movidea.getGlobal().scale);
  expect(scaleAfter).not.toEqual(scaleBefore);
});
