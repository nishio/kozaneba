import { CDPSession, Page } from "@playwright/test";
import type { TRecordedEvent, TRecording } from "../../src/Recorder/recorder";
import { diff_snapshot, TSnapshot } from "../../src/Recorder/snapshot";

// Replays a recorded touch session through the Chrome DevTools Protocol.
// Input.dispatchTouchEvent goes through the browser's real hit-testing and
// pointer-event generation (multi-touch included), unlike dispatching
// events to elements from page script.

const MAX_GAP_MS = 1000; // idle time between gestures is shortened to this

export const open_board = async (page: Page, rec: TRecording) => {
  // Always a local board: a replay must never touch a real Firestore doc.
  await page.goto("/#blank");
  await page.waitForFunction(() => !!window.movidea && !!window.__kozaneba_snapshot);
  await page.evaluate((board) => {
    window.movidea.updateGlobal((g) => {
      Object.assign(g, JSON.parse(JSON.stringify(board)));
    });
  }, rec.initial_board);
  await page.waitForTimeout(300);
};

const snapshot_of = (page: Page) =>
  page.evaluate(() => window.__kozaneba_snapshot!());

type TFailure = { checkpoint: number; after_event: number; diffs: string[] };

export const replay = async (
  page: Page,
  cdp: CDPSession,
  rec: TRecording
): Promise<TFailure[]> => {
  const touches = new Map<number, { x: number; y: number; id: number }>();
  let last_press = { t: -1e9, x: 0, y: 0, count: 0 };
  const failures: TFailure[] = [];
  let prev_t = rec.events[0]?.t ?? 0;
  let next_cp = 0;

  let next_touch_id = 0;

  const dispatch = async (e: TRecordedEvent) => {
    if (e.pt === "touch") {
      // Each event lists only the touch point that changed, by id: a
      // touchEnd releases the points it lists (listing the fingers that stay
      // down released those instead).
      if (e.type === "down") {
        const p = { x: e.x, y: e.y, id: next_touch_id++ };
        touches.set(e.id, p);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [p] });
      } else if (e.type === "move") {
        const p = touches.get(e.id);
        if (p === undefined) return;
        p.x = e.x;
        p.y = e.y;
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [p] });
      } else {
        const p = touches.get(e.id);
        if (p === undefined) return;
        // iOS reports the up where the finger left, which can differ from the
        // last move; move it there first (a drop lands at the up position).
        // Only for the last finger: while others are down (a pinch) the app
        // ignores the up position, and an extra move would add a pinch step
        // iOS never sent.
        if (touches.size === 1 && (p.x !== e.x || p.y !== e.y)) {
          p.x = e.x;
          p.y = e.y;
          await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [p] });
        }
        touches.delete(e.id);
        await cdp.send("Input.dispatchTouchEvent", {
          type: e.type === "up" ? "touchEnd" : "touchCancel",
          touchPoints: [p],
        });
      }
      return;
    }
    // mouse and pen
    const button = e.b & 2 ? "right" : "left";
    if (e.type === "down") {
      const near = Math.hypot(e.x - last_press.x, e.y - last_press.y) < 5;
      const count = e.t - last_press.t < 500 && near ? last_press.count + 1 : 1;
      last_press = { t: e.t, x: e.x, y: e.y, count };
      await cdp.send("Input.dispatchMouseEvent", {
        type: "mousePressed", x: e.x, y: e.y, button, buttons: e.b,
        clickCount: count, pointerType: e.pt === "pen" ? "pen" : "mouse",
      });
    } else if (e.type === "move") {
      await cdp.send("Input.dispatchMouseEvent", {
        type: "mouseMoved", x: e.x, y: e.y, button: "none", buttons: e.b,
        pointerType: e.pt === "pen" ? "pen" : "mouse",
      });
    } else {
      await cdp.send("Input.dispatchMouseEvent", {
        type: "mouseReleased", x: e.x, y: e.y, button, buttons: 0,
        clickCount: last_press.count, pointerType: e.pt === "pen" ? "pen" : "mouse",
      });
    }
  };

  for (let i = 0; i < rec.events.length; i++) {
    const e = rec.events[i]!;
    const gap = Math.min(e.t - prev_t, MAX_GAP_MS);
    if (gap > 4) await page.waitForTimeout(gap);
    prev_t = e.t;
    await dispatch(e);

    const cp = rec.checkpoints[next_cp];
    if (cp !== undefined && cp.after === i + 1) {
      await page.waitForTimeout(Math.min(Math.max(cp.t - e.t, 300), MAX_GAP_MS));
      const diffs = diff_snapshot(cp.state, (await snapshot_of(page)) as TSnapshot);
      if (diffs.length > 0) failures.push({ checkpoint: next_cp, after_event: i + 1, diffs });
      next_cp++;
      prev_t = cp.t;
    }
  }
  return failures;
};
