// Which local backups to keep (D1 / D8). Pure functions, so that the policy
// can be tested without IndexedDB.

export type TBackupMeta = {
  id: number;
  cloud_ba: string;
  saved_at: number; // when this backup was taken (local clock)
  size: number; // length of the JSON
  n_items: number;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const BACKUP_POLICY = {
  // every save is backed up; the newest ones are all kept
  keep_recent: 20,
  // older than that: the newest one of each hour for 2 days,
  hourly_for: 2 * DAY,
  // then the newest one of each day for 30 days,
  daily_for: 30 * DAY,
  // then the newest one of each month (until the total cap removes it).
  // Total size of all backups of all Ba, in JSON characters.
  total_cap: 30_000_000,
};

const bucket_of = (saved_at: number, now: number) => {
  const age = now - saved_at;
  const d = new Date(saved_at);
  if (age < BACKUP_POLICY.hourly_for) return `h${Math.floor(saved_at / HOUR)}`;
  if (age < BACKUP_POLICY.daily_for)
    return `d${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  return `m${d.getFullYear()}-${d.getMonth()}`;
};

// backups of one Ba -> ids to delete
export const select_thinned = (metas: TBackupMeta[], now: number): number[] => {
  const newest_first = [...metas].sort((a, b) => b.saved_at - a.saved_at);
  const seen = new Set<string>();
  const to_delete: number[] = [];
  newest_first.forEach((m, i) => {
    const bucket = bucket_of(m.saved_at, now);
    const is_first_of_bucket = !seen.has(bucket);
    seen.add(bucket);
    if (i < BACKUP_POLICY.keep_recent || is_first_of_bucket) return;
    to_delete.push(m.id);
  });
  return to_delete;
};

// backups of all Ba -> ids to delete so that the total stays under the cap.
// The oldest go first; the newest backup of each Ba is never deleted here.
export const select_over_cap = (
  metas: TBackupMeta[],
  cap = BACKUP_POLICY.total_cap
): number[] => {
  let total = metas.reduce((s, m) => s + m.size, 0);
  if (total <= cap) return [];
  const newest_of_ba = new Map<string, TBackupMeta>();
  metas.forEach((m) => {
    const x = newest_of_ba.get(m.cloud_ba);
    if (x === undefined || x.saved_at < m.saved_at) newest_of_ba.set(m.cloud_ba, m);
  });
  const protected_ids = new Set([...newest_of_ba.values()].map((m) => m.id));
  const oldest_first = [...metas].sort((a, b) => a.saved_at - b.saved_at);
  const to_delete: number[] = [];
  for (const m of oldest_first) {
    if (total <= cap) break;
    if (protected_ids.has(m.id)) continue;
    to_delete.push(m.id);
    total -= m.size;
  }
  return to_delete;
};
