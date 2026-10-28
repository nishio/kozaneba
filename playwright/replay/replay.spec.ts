import { test, expect, Page, CDPSession } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { TRecording } from "../../src/Recorder/recorder";
import { open_board, replay } from "./replay";

// Every recording in playwright/recordings/ (made on a real iPad with
// `#blank&record=sample`, saved from the REC panel) is replayed, and the
// board after each gesture must match what the person saw.

const DIR = join(__dirname, "..", "recordings");
const files = (() => {
  try {
    return readdirSync(DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
})();

const touch = async (cdp: CDPSession, type: string, points: { x: number; y: number }[]) => {
  await cdp.send("Input.dispatchTouchEvent", {
    type,
    touchPoints: points.map((p, id) => ({ ...p, id })),
  });
};
const center = async (page: Page, testid: string) => {
  const box = await page.locator(`[data-testid="${testid}"]`).first().boundingBox();
  if (!box) throw new Error(`no box for ${testid}`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};
const drag = async (page: Page, cdp: CDPSession, from: { x: number; y: number }, to: { x: number; y: number }) => {
  await touch(cdp, "touchStart", [from]);
  for (let i = 1; i <= 8; i++) {
    const p = { x: from.x + ((to.x - from.x) * i) / 8, y: from.y + ((to.y - from.y) * i) / 8 };
    await touch(cdp, "touchMove", [p]);
    await page.waitForTimeout(16);
  }
  await touch(cdp, "touchEnd", []);
  await page.waitForTimeout(500);
};

test.describe("replay of recorded touch sessions", () => {
  for (const f of files) {
    test(f, async ({ page, context }) => {
      const rec = JSON.parse(readFileSync(join(DIR, f), "utf8")) as TRecording;
      test.skip(rec.version !== 1, "unknown recording version");
      await page.setViewportSize(rec.viewport);
      await open_board(page, rec);
      const cdp = await context.newCDPSession(page);
      const failures = await replay(page, cdp, rec);
      expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
    });
  }

  // Keeps the recorder and the replayer honest without a device: record a
  // session in this browser through real (CDP) touches, then replay it on a
  // fresh page and require the same boards.
  test("self-test: a session recorded here replays to the same boards", async ({ browser }) => {
    const rec_ctx = await browser.newContext({ hasTouch: true, viewport: { width: 1024, height: 768 } });
    const page = await rec_ctx.newPage();
    await page.goto("/#blank&record=sample");
    await expect(page.locator("[data-recorder-ui]")).toBeVisible();
    await expect(page.locator('[data-testid="k1"]')).toBeVisible();
    const cdp = await rec_ctx.newCDPSession(page);

    const k1 = await center(page, "k1");
    await drag(page, cdp, k1, { x: k1.x + 120, y: k1.y + 40 }); // move a kozane
    const k2 = await center(page, "k2");
    const ga = await center(page, "grouptitle-ga");
    await drag(page, cdp, k2, { x: ga.x, y: ga.y + 60 }); // drop into a group
    await touch(cdp, "touchStart", [{ x: 60, y: 500 }]); // tap the background
    await touch(cdp, "touchEnd", []);
    await page.waitForTimeout(500);

    const rec = await page.evaluate(() => window.__kozaneba_recording!());
    await rec_ctx.close();
    expect(rec.events.length).toBeGreaterThan(10);
    expect(rec.checkpoints.length).toBe(3);
    // the touches reached the app: k1 moved
    const first = rec.checkpoints[0]!.state.itemStore["k1"]!.position;
    expect(first).not.toEqual(rec.initial_board.itemStore["k1"]!.position);

    const ctx = await browser.newContext({ hasTouch: true, viewport: rec.viewport });
    const replay_page = await ctx.newPage();
    await open_board(replay_page, rec);
    const failures = await replay(replay_page, await ctx.newCDPSession(replay_page), rec);
    await ctx.close();
    expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
  });
});
