import { describe, expect, test } from "vitest";
import { State } from "reactn/default";
import { INITIAL_GLOBAL_STATE } from "./Global/initializeGlobalState";
import { device_context, sentry_context } from "./sentry_context";

describe("sentry_context", () => {
  const g = {
    ...INITIAL_GLOBAL_STATE,
    cloud_ba: "secret-ba-id",
    title: "secret title",
    writers: ["uid-1", "uid-2"],
    user: { uid: "uid-1", email: "a@example.com" },
    itemStore: { k1: {}, k2: {} },
    drawOrder: ["k1"],
  } as unknown as State;

  test("carries counts and flags only", () => {
    expect(sentry_context(g)).toEqual({
      dialog: "",
      status: "no-connection",
      signed_in: true,
      is_cloud: true,
      is_local_change: false,
      num_items: 2,
      num_top_level: 1,
      scale: 1,
    });
  });

  test("does not leak the ba id, title, uids or email", () => {
    const sent = JSON.stringify(sentry_context(g));
    for (const secret of ["secret-ba-id", "secret title", "uid-1", "uid-2", "a@example.com"]) {
      expect(sent).not.toContain(secret);
    }
  });
});

describe("device_context", () => {
  test("reports the input device", () => {
    const d = device_context();
    expect(typeof d.max_touch_points).toBe("number");
    expect(typeof d.pointer_coarse).toBe("boolean");
    expect(d.viewport).toMatch(/^\d+x\d+$/);
  });
});
