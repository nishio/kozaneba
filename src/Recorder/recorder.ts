import { getGlobal } from "reactn";
import { State } from "reactn/default";
import { snapshot, TSnapshot } from "./snapshot";

// Records a real touch session (iPad, pen, mouse) so it can be replayed as
// a test. Turned on with `&record` in the hash, e.g. `#blank&record=sample`.
// It only listens (capture phase, passive) and never changes what the app
// does with the events.

export type TRecordedEvent = {
  t: number; // ms since the recording started
  type: "down" | "move" | "up" | "cancel";
  id: number; // pointerId
  pt: string; // pointerType
  primary: boolean;
  x: number; // clientX
  y: number; // clientY
  b: number; // buttons
};
export type TCheckpoint = { t: number; after: number; state: TSnapshot };
export type TRecording = {
  version: 1;
  recorded_at: string;
  hash: string; // the hash to open for replay, without `record`
  sample: boolean;
  user_agent: string;
  viewport: { width: number; height: number };
  device_pixel_ratio: number;
  max_touch_points: number;
  initial_board: TBoard;
  events: TRecordedEvent[];
  checkpoints: TCheckpoint[];
};
// Enough to rebuild the starting board in a replay. Text is masked (same
// length) so recordings of real boards do not carry their content.
export type TBoard = Pick<
  State,
  "itemStore" | "drawOrder" | "annotations" | "scale" | "trans_x" | "trans_y"
>;

const TYPE_OF: { [k: string]: TRecordedEvent["type"] } = {
  pointerdown: "down",
  pointermove: "move",
  pointerup: "up",
  pointercancel: "cancel",
};
const SETTLE_MS = 300;
const round = (v: number) => Math.round(v * 10) / 10;

export const mask_text = (s: string) => s.replace(/[^\n]/g, "x");

export const board_of = (g: State): TBoard => {
  const itemStore = JSON.parse(JSON.stringify(g.itemStore)) as State["itemStore"];
  Object.values(itemStore).forEach((item) => {
    if ("text" in item && typeof item.text === "string") {
      item.text = mask_text(item.text);
    }
  });
  return {
    itemStore,
    drawOrder: [...g.drawOrder],
    annotations: JSON.parse(JSON.stringify(g.annotations)),
    scale: g.scale,
    trans_x: g.trans_x,
    trans_y: g.trans_y,
  };
};

// Pure part of the recorder, separated from the DOM for tests.
export const create_session = (
  now: () => number,
  read_state: () => State,
  on_change: (n: number) => void = () => {}
) => {
  const start = now();
  const events: TRecordedEvent[] = [];
  const checkpoints: TCheckpoint[] = [];
  const down = new Set<number>();
  let initial: TBoard | null = null;
  let last_event_t = 0;
  let checkpointed_at = -1;

  const record = (e: {
    type: string;
    pointerId: number;
    pointerType: string;
    isPrimary: boolean;
    clientX: number;
    clientY: number;
    buttons: number;
  }) => {
    const type = TYPE_OF[e.type];
    if (type === undefined) return;
    // a mouse moving with no button down is not part of a gesture
    if (type === "move" && !down.has(e.pointerId)) return;
    if (initial === null) initial = board_of(read_state());
    if (type === "down") down.add(e.pointerId);
    if (type === "up" || type === "cancel") down.delete(e.pointerId);
    last_event_t = round(now() - start);
    events.push({
      t: last_event_t,
      type,
      id: e.pointerId,
      pt: e.pointerType,
      primary: e.isPrimary,
      x: round(e.clientX),
      y: round(e.clientY),
      b: e.buttons,
    });
    on_change(events.length);
  };

  // Called periodically: once no pointer is down and nothing happened for
  // SETTLE_MS, the state is what the person saw after the gesture.
  const tick = () => {
    if (down.size > 0 || events.length === 0) return;
    if (checkpointed_at === events.length) return;
    if (now() - start - last_event_t < SETTLE_MS) return;
    checkpoints.push({
      t: round(now() - start),
      after: events.length,
      state: snapshot(read_state()),
    });
    checkpointed_at = events.length;
  };

  const result = (meta: Omit<TRecording, "events" | "checkpoints" | "initial_board">): TRecording => ({
    ...meta,
    initial_board: initial ?? board_of(read_state()),
    events: [...events],
    checkpoints: [...checkpoints],
  });

  return { record, tick, result, count: () => events.length };
};

const hash_without_record = () => {
  const params = new URLSearchParams(window.location.hash.substring(1));
  params.delete("record");
  return params.toString().replace(/=(&|$)/g, "$1");
};

export const is_record_requested = () =>
  new URLSearchParams(window.location.hash.substring(1)).has("record");
export const is_sample_requested = () =>
  new URLSearchParams(window.location.hash.substring(1)).get("record") === "sample";

export const install_recorder = () => {
  const sample = is_sample_requested();
  const hash = hash_without_record();
  let set_count: (n: number) => void = () => {};
  const session = create_session(
    () => performance.now(),
    () => getGlobal(),
    (n) => set_count(n)
  );
  const opts = { capture: true, passive: true };
  const listener = (e: PointerEvent) => {
    if ((e.target as Element | null)?.closest?.("[data-recorder-ui]")) return;
    session.record(e);
  };
  for (const type of Object.keys(TYPE_OF)) {
    window.addEventListener(type, listener as EventListener, opts);
  }
  window.setInterval(session.tick, 100);

  const recording = () =>
    session.result({
      version: 1,
      recorded_at: new Date().toISOString(),
      hash,
      sample,
      user_agent: navigator.userAgent,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      device_pixel_ratio: window.devicePixelRatio,
      max_touch_points: navigator.maxTouchPoints ?? 0,
    });
  set_count = mount_ui(recording);
  // lets the harness's own self-test read what was recorded
  window.__kozaneba_recording = recording;
};

// A small fixed panel outside #canvas, so it never takes part in the
// gestures being recorded.
const mount_ui = (recording: () => TRecording) => {
  const box = document.createElement("div");
  box.setAttribute("data-recorder-ui", "");
  box.style.cssText =
    "position:fixed;left:8px;bottom:8px;z-index:100000;display:flex;gap:8px;" +
    "align-items:center;padding:6px 10px;border-radius:8px;" +
    "background:rgba(0,0,0,0.75);color:white;font:14px sans-serif;";
  const label = document.createElement("span");
  label.textContent = "● REC 0";
  const button = (text: string, onclick: () => void) => {
    const b = document.createElement("button");
    b.textContent = text;
    b.style.cssText = "min-width:44px;min-height:44px;font:14px sans-serif;";
    b.addEventListener("click", onclick);
    box.appendChild(b);
  };
  box.appendChild(label);
  button("Save", () => void save(recording()));
  button("Copy", () => void navigator.clipboard?.writeText(JSON.stringify(recording())));
  for (const type of ["pointerdown", "pointerup", "click"]) {
    box.addEventListener(type, (e) => e.stopPropagation());
  }
  document.body.appendChild(box);
  return (n: number) => {
    label.textContent = `● REC ${n}`;
  };
};

const save = async (rec: TRecording) => {
  const name = `kozaneba-touch-${rec.recorded_at.replace(/[:.]/g, "-")}.json`;
  const file = new File([JSON.stringify(rec)], name, { type: "application/json" });
  // iPad: the share sheet can save to Files or AirDrop it
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch {
      // cancelled or not allowed: fall back to a download
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
};

declare global {
  interface Window {
    __kozaneba_recording?: () => TRecording;
  }
}
