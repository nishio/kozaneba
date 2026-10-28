// Optimistic concurrency for the whole-doc save (D3 / D14).
//
// A save writes the whole Ba. It may only replace the version of the doc that
// this tab's state is based on. Versions are the doc's last_updated values:
// - base: the last server version this tab took in (loaded or followed)
// - own: versions this tab wrote itself (in this session)
// If the server has any other version, someone else (another device, another
// tab, a sleeping tab that woke up) wrote in between, and the save must not
// overwrite it.

type TSync = {
  ba: string;
  base: number | undefined;
  own: Set<number>;
  inflight: number;
};

let sync: TSync = { ba: "", base: undefined, own: new Set(), inflight: 0 };

const of_ba = (ba: string): TSync => {
  if (sync.ba !== ba) {
    sync = { ba, base: undefined, own: new Set(), inflight: 0 };
  }
  return sync;
};

export const as_version = (x: unknown): number | undefined =>
  typeof x === "number" && Number.isFinite(x) ? x : undefined;

export const note_server_version = (ba: string, version: number | undefined) => {
  of_ba(ba).base = version;
};

export const note_own_write = (ba: string, version: number) => {
  of_ba(ba).own.add(version);
};

export const is_own_version = (ba: string, version: number | undefined) =>
  version !== undefined && of_ba(ba).own.has(version);

// The tab's state is based on this server version (it may overwrite it).
export const may_overwrite = (ba: string, version: number | undefined) => {
  const s = of_ba(ba);
  if (version === undefined) return false;
  return version === s.base || s.own.has(version);
};

export const begin_write = (ba: string) => {
  of_ba(ba).inflight++;
};
export const end_write = (ba: string) => {
  const s = of_ba(ba);
  s.inflight = Math.max(0, s.inflight - 1);
};
export const has_write_in_flight = (ba: string) => of_ba(ba).inflight > 0;

// for tests
export const reset_sync_version = () => {
  sync = { ba: "", base: undefined, own: new Set(), inflight: 0 };
};
