// The thinning as it runs: `add_backup` takes a backup and then `prune`s the
// Ba at that time, so select_thinned is applied again and again to what the
// earlier calls left. These tests follow that sequence (without IndexedDB:
// `prune` is select_thinned followed by deleting the returned ids).
// The cases come from the Lean model in verification/lean-backup-policy.
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { BACKUP_POLICY, select_thinned, TBackupMeta } from "./backup_policy";

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const meta = (id: number, saved_at: number): TBackupMeta => ({
  id,
  cloud_ba: "ba1",
  saved_at,
  size: 100,
  n_items: 1,
});

// add_backup + prune, once for each time in `times` (ids in the order of adding)
const save_each = (times: number[]) => {
  let kept: TBackupMeta[] = [];
  const lost_on_add: number[] = [];
  times.forEach((t, id) => {
    const m = meta(id, t);
    kept = [...kept, m];
    const del = new Set(select_thinned(kept, t));
    if (del.has(id)) lost_on_add.push(id);
    kept = kept.filter((x) => !del.has(x.id));
  });
  return { kept, lost_on_add };
};

const local_day = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

describe("in a time zone with a 30-minute offset (Asia/Kolkata, +5:30)", () => {
  let tz: string | undefined;
  beforeAll(() => {
    tz = process.env.TZ;
    process.env.TZ = "Asia/Kolkata";
  });
  afterAll(() => {
    if (tz === undefined) delete process.env.TZ;
    else process.env.TZ = tz;
  });

  test("a day whose only saves were in its last 30 minutes keeps a backup", () => {
    // 23:30-00:30 IST is one UTC hour (18:00-19:00 UTC)
    expect(new Date(2026, 9, 27, 23, 45).getUTCMinutes()).toBe(15);
    const late = new Date(2026, 9, 27, 23, 45).getTime(); // the only save of Oct 27
    const next = Array.from({ length: BACKUP_POLICY.keep_recent + 1 }, (_, i) =>
      new Date(2026, 9, 28, 0, 5 + i).getTime()
    );
    const { kept } = save_each([late, ...next]);
    // Three days later, Oct 27 is in the daily range. Thinning everything at
    // once would keep `late` as the backup of Oct 27:
    const later = late + 3 * DAY;
    const all = [late, ...next].map((t, id) => meta(id, t));
    const once = all.filter((m) => !select_thinned(all, later).includes(m.id));
    expect(once.map((m) => local_day(m.saved_at))).toContain("2026-10-27");
    // Saving one by one must keep it too
    expect(kept.map((m) => local_day(m.saved_at))).toContain("2026-10-27");
  });
});

describe("when the clock goes back", () => {
  test("the backup just taken is not deleted by its own prune", () => {
    // 21 saves at 10:40-10:50 by a clock that was ahead, then the clock is
    // set back 15 minutes and the user saves again at 10:36 (same UTC hour)
    const base = Date.UTC(2026, 9, 27, 10, 40);
    const ahead = Array.from({ length: BACKUP_POLICY.keep_recent + 1 }, (_, i) => base + i * 30 * 1000);
    const back = base - 4 * MIN;
    const { lost_on_add } = save_each([...ahead, back]);
    expect(lost_on_add).toEqual([]);
  });

  test("a backup saved in the same millisecond as 20 others is kept when it is taken", () => {
    const t = Date.UTC(2026, 9, 27, 10, 40);
    const { lost_on_add } = save_each(Array.from({ length: BACKUP_POLICY.keep_recent + 1 }, () => t));
    expect(lost_on_add).toEqual([]);
  });
});
