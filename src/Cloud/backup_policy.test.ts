import { describe, expect, test } from "vitest";
import {
  BACKUP_POLICY,
  select_over_cap,
  select_thinned,
  TBackupMeta,
} from "./backup_policy";

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
// a fixed local time, 2026-10-27 15:30
const NOW = new Date(2026, 9, 27, 15, 30).getTime();

const meta = (id: number, saved_at: number, cloud_ba = "ba1", size = 100): TBackupMeta => ({
  id,
  cloud_ba,
  saved_at,
  size,
  n_items: 1,
});

const kept = (metas: TBackupMeta[], now = NOW) => {
  const del = new Set(select_thinned(metas, now));
  return metas.filter((m) => !del.has(m.id));
};

describe("select_thinned", () => {
  test("keeps the newest 20 saves even within one minute", () => {
    // 100 saves, one per second, all in the last 2 minutes
    const metas = Array.from({ length: 100 }, (_, i) => meta(i, NOW - (100 - i) * 1000));
    const k = kept(metas);
    // the newest 20, plus the newest of the earlier hour bucket if any
    expect(k.map((m) => m.id).slice(-20)).toEqual(Array.from({ length: 20 }, (_, i) => 80 + i));
    expect(k.length).toBeLessThanOrEqual(21);
    expect(k.length).toBeGreaterThanOrEqual(20);
  });

  test("a save every 10 minutes for 70 days thins to recent + hourly + daily + monthly", () => {
    const n = (70 * DAY) / (10 * MIN);
    const metas = Array.from({ length: n }, (_, i) => meta(i, NOW - i * 10 * MIN));
    const k = kept(metas);
    // bounded: 20 recent + ~48 hourly + ~30 daily + 2 monthly
    expect(k.length).toBeLessThan(20 + 49 + 31 + 3);
    expect(k.length).toBeGreaterThan(20 + 40 + 25);
    // the newest 20 are kept
    for (let i = 0; i < 20; i++) expect(k.some((m) => m.id === i)).toBe(true);
    // something from about 1 day ago and 1 week ago is kept
    const has_near = (t: number, tol: number) => k.some((m) => Math.abs(m.saved_at - t) <= tol);
    expect(has_near(NOW - DAY, HOUR)).toBe(true);
    expect(has_near(NOW - 7 * DAY, DAY)).toBe(true);
    // in the hourly range, at most one per hour (beyond the newest 20)
    const hourly = k.filter((m) => m.id >= 20 && NOW - m.saved_at < BACKUP_POLICY.hourly_for);
    const hours = hourly.map((m) => Math.floor(m.saved_at / HOUR));
    expect(new Set(hours).size).toBe(hours.length);
    // older than 30 days (Aug 18 .. Sep 27): one per month, August and September
    const monthly = k.filter((m) => NOW - m.saved_at >= BACKUP_POLICY.daily_for);
    expect(monthly.map((m) => new Date(m.saved_at).getMonth()).sort()).toEqual([7, 8]);
  });

  test("in each kept bucket, the newest backup is the one kept", () => {
    const metas = [
      meta(1, NOW - 3 * DAY - 2 * HOUR),
      meta(2, NOW - 3 * DAY - 1 * HOUR), // same day as 1, newer
      ...Array.from({ length: 20 }, (_, i) => meta(100 + i, NOW - i * MIN)),
    ];
    const ids = kept(metas).map((m) => m.id);
    expect(ids).toContain(2);
    expect(ids).not.toContain(1);
  });
});

describe("select_over_cap", () => {
  test("deletes the oldest first and never the newest backup of a Ba", () => {
    const metas = [
      meta(1, NOW - 10 * DAY, "big", 600),
      meta(2, NOW - 5 * DAY, "small", 100),
      meta(3, NOW - 2 * DAY, "big", 600),
      meta(4, NOW - 1 * DAY, "big", 600),
    ];
    // total 1900, cap 1000: delete 1 (600 -> 1300), then 2 is the newest of
    // "small" (protected), then 3 (600 -> 700)
    expect(select_over_cap(metas, 1000)).toEqual([1, 3]);
  });

  test("does nothing under the cap", () => {
    expect(select_over_cap([meta(1, NOW, "a", 10), meta(2, NOW, "b", 10)], 100)).toEqual([]);
  });
});
