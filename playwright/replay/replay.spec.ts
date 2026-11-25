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

// A recording replays taps by position, so it only matches the layout the
// person saw. Recordings made while the menu items were MUI's 36px on the iPad
// width (before #110 raised them to 44px on touch) tap menu rows at 36px
// steps; for those, put the old menu item heights back during the replay.
// Re-record on a device after #110 and drop the file from this set.
const MENU_ITEMS_36PX = new Set(["ipad-2026-10-29-sample-board.json"]);
const MENU_ITEMS_36PX_CSS = `
.MuiMenuItem-root.MuiMenuItem-root.MuiMenuItem-root { min-height: auto; }
.MuiMenuItem-root.MuiMenuItem-root.MuiMenuItem-dense { min-height: 32px; }
`;

// Checkpoints where the recording shows a bug that was fixed after it was
// recorded, so the app no longer makes the board the person saw. Each entry
// replaces the stored position the recording has (`was`) with the one the
// fixed app makes (`now`); everything else in the checkpoint is still checked.
// An entry whose `was` is not in the recording fails the test, so it cannot
// silently apply to another session. Re-record on a device and drop the entry.
type TFix = { checkpoints: number[]; why: string; positions: { [id: string]: { was: [number, number]; now: [number, number] } } };
const FIXED_SINCE_RECORDING: { [file: string]: TFix[] } = {
  "ipad-2026-10-29-sample-board.json": [
    {
      // Events 1076-1115: n1 is dragged inside its group gn and dropped on gn
      // again. On the iPad n1 jumped 20 down from where the finger left
      // (world y 269 -> 289), by its old offset from gn's anchor: K2, fixed in
      // #145. n1 is gn's only child, so gn's anchor carries the difference.
      // See "the recorded iPad session" in src/Event/nested_coords_regressions.test.ts.
      checkpoints: [16],
      why: "K2 (#145): a drop into its own group no longer shifts the item",
      positions: {
        gn: { was: [419.9751472718622, 289.004125650847], now: [419.9751472718622, 269.004125650847] },
      },
    },
    {
      // Events 1116-1196 drop gn (20 higher than recorded, above) into ga.
      // gn lands where the finger left, 20 higher than recorded; ga's anchor
      // is re-centered on its children, 10 higher, and a1, a2 get +10 in ga's
      // frame, so their world positions are the recorded ones. Later gestures
      // do not touch these items.
      checkpoints: [17, 18, 19],
      why: "follows from checkpoint 16",
      positions: {
        ga: { was: [230.9642436042504, 62.732588380106534], now: [230.9642436042504, 52.73258838010665] },
        gn: { was: [31.60933201267224, 142.73258838010656], now: [31.60933201267224, 132.73258838010668] },
        a1: { was: [-90.96424360425041, -142.73258838010653], now: [-90.96424360425041, -132.73258838010665] },
        a2: { was: [90.96424360425041, -134.66898327483298], now: [90.96424360425041, -124.6689832748331] },
      },
    },
  ],
};
const apply_fixes = (rec: TRecording, fixes: TFix[]) => {
  for (const fix of fixes) {
    for (const cp of fix.checkpoints) {
      const items = rec.checkpoints[cp]!.state.itemStore;
      for (const [id, { was, now }] of Object.entries(fix.positions)) {
        const p = items[id]!.position;
        if (Math.abs(p[0] - was[0]) > 1e-6 || Math.abs(p[1] - was[1]) > 1e-6) {
          throw new Error(`FIXED_SINCE_RECORDING (${fix.why}): checkpoint ${cp} item ${id} is ${p}, not ${was}`);
        }
        items[id]!.position = [...now];
      }
    }
  }
};

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
      apply_fixes(rec, FIXED_SINCE_RECORDING[f] ?? []);
      await page.setViewportSize(rec.viewport);
      await open_board(page, rec);
      if (MENU_ITEMS_36PX.has(f)) await page.addStyleTag({ content: MENU_ITEMS_36PX_CSS });
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
