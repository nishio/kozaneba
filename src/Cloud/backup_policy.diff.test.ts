// Cases for the differential check against the Lean copy of backup_policy.ts
// (verification/lean-backup-policy). Random inputs (fixed seed) around the
// boundaries, in several time zones; the outputs of select_thinned and
// select_over_cap are written to verification/lean-backup-policy/diff/cases.json,
// and the Lean `check` reads that file and compares its own copy.
//
// This test fails when the file is not what the code gives now. After a
// change to backup_policy.ts, regenerate it and run the Lean check:
//   UPDATE_BACKUP_POLICY_CASES=1 npx vitest run src/Cloud/backup_policy.diff.test.ts
//   cd verification/lean-backup-policy && lake build && .lake/build/bin/check
import * as fs from "node:fs";
import * as path from "node:path";
import { afterAll, expect, test } from "vitest";
import { select_over_cap, select_thinned, TBackupMeta } from "./backup_policy";

const FILE = path.resolve(process.cwd(), "verification/lean-backup-policy/diff/cases.json");

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// whole-hour offsets, 30 / 45-minute offsets, and summer time (incl. 30 min)
const ZONES = [
  "UTC",
  "Asia/Tokyo",
  "Asia/Kolkata",
  "Asia/Kathmandu",
  "America/New_York",
  "America/St_Johns",
  "Australia/Lord_Howe",
];

// mulberry32
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const original_tz = process.env.TZ;
afterAll(() => {
  if (original_tz === undefined) delete process.env.TZ;
  else process.env.TZ = original_tz;
});

const make_cases = () => {
  const r = rng(20261125);
  const int = (n: number) => Math.floor(r() * n);
  const pick = <T>(xs: T[]): T => xs[int(xs.length)]!;
  const cases: unknown[] = [];
  for (const tz of ZONES) {
    process.env.TZ = tz;
    for (let c = 0; c < 30; c++) {
      // now: some time in 2026, often just after a local midnight or a month start
      const base = Date.UTC(2026, int(12), 1 + int(28), int(24), int(60), int(60), int(1000));
      const nd = new Date(base);
      const now = pick([
        base,
        new Date(nd.getFullYear(), nd.getMonth(), nd.getDate()).getTime() + int(3) * MIN,
        new Date(nd.getFullYear(), nd.getMonth(), 1).getTime() + int(2) * HOUR,
      ]);
      const local_midnight = (days_ago: number) => {
        const d = new Date(now - days_ago * DAY);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      };
      const month_start = (months_ago: number) => {
        const d = new Date(now);
        return new Date(d.getFullYear(), d.getMonth() - months_ago, 1).getTime();
      };
      const saved_at = (prev: number[]): number => {
        switch (int(10)) {
          case 0: // exactly at / next to the 2-day and 30-day lines
            return now - pick([2 * DAY, 30 * DAY]) + pick([-1, 0, 1]);
          case 1: // around a local midnight (often a recent one: the hourly range)
            return local_midnight(pick([0, 1, int(40)])) + pick([-1, 0, 1]) * int(45) * MIN + pick([-1, 0, 1]);
          case 2: // around a month start
            return month_start(int(3)) + pick([-1, 0, 1]) * int(3) * HOUR + pick([-1, 0]);
          case 3: // the same time as another backup
            return prev.length > 0 ? pick(prev) : now;
          case 4: // in the future (the clock went back)
            return now + int(3 * HOUR);
          case 5: // the last hours
            return now - int(3 * HOUR);
          default:
            return now - int(pick([2, 35, 120]) * DAY);
        }
      };
      const n_a = pick([0, 1, 5, 21, 25, 40, 60]);
      const n_b = int(8);
      const metas: TBackupMeta[] = [];
      const times: number[] = [];
      for (let i = 0; i < n_a + n_b; i++) {
        const t = saved_at(times);
        times.push(t);
        metas.push({
          id: i + 1, // in the order of adding, as IndexedDB returns them
          cloud_ba: i < n_a || int(3) === 0 ? "a" : "b",
          saved_at: t,
          size: 1 + int(1000),
          n_items: 0,
        });
      }
      const total = metas.reduce((s, m) => s + m.size, 0);
      // exactly what is left after deleting the k oldest (the `total <= cap` line)
      const oldest_first = [...metas].sort((a, b) => a.saved_at - b.saved_at);
      const k = int(metas.length + 1);
      const left = total - oldest_first.slice(0, k).reduce((s, m) => s + m.size, 0);
      const cap = pick([total + 1, total, Math.floor(total * r()), 0, left, left]);
      const of_a = metas.filter((m) => m.cloud_ba === "a");
      cases.push({
        tz,
        now,
        cap,
        // [id, ba, saved_at, size, local offset in minutes at saved_at]
        metas: metas.map((m) => [
          m.id,
          m.cloud_ba,
          m.saved_at,
          m.size,
          -new Date(m.saved_at).getTimezoneOffset(),
        ]),
        thinned_a: select_thinned(of_a, now),
        over_cap: select_over_cap(metas, cap),
      });
    }
  }
  return cases;
};

test("the cases for the Lean differential check are up to date", () => {
  const text = JSON.stringify({ cases: make_cases() }) + "\n";
  if (process.env.UPDATE_BACKUP_POLICY_CASES) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, text);
  }
  const on_disk = fs.existsSync(FILE) ? fs.readFileSync(FILE, "utf8") : "";
  // not toBe: the diff of two long strings is not readable
  expect(
    on_disk === text,
    "verification/lean-backup-policy/diff/cases.json is not what backup_policy.ts gives now; " +
      "regenerate it with UPDATE_BACKUP_POLICY_CASES=1 and run the Lean check"
  ).toBe(true);
});
