import { State } from "reactn/default";

// What an error report carries about the app state. Only counts and flags:
// no ba id, title, writers (uids) or kozane text, because anyone who knows
// the id of an anyone_writable ba can edit it.
export const sentry_context = (g: State) => {
  return {
    dialog: g.dialog,
    status: g.statusBar.type,
    signed_in: g.user !== null,
    is_cloud: g.cloud_ba !== "",
    is_local_change: g.is_local_change,
    num_items: Object.keys(g.itemStore).length,
    num_top_level: g.drawOrder.length,
    scale: g.scale,
  };
};

// The input device matters for touch bugs (iPad, pen), which are hard to
// reproduce from a stack trace alone.
export const device_context = () => {
  const mq = (q: string) =>
    typeof window.matchMedia === "function" && window.matchMedia(q).matches;
  return {
    max_touch_points: navigator.maxTouchPoints ?? 0,
    pointer_coarse: mq("(pointer: coarse)"),
    hover_none: mq("(hover: none)"),
    standalone: mq("(display-mode: standalone)"),
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    dpr: window.devicePixelRatio,
  };
};
