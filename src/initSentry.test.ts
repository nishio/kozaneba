import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { getGlobal, setGlobal } from "reactn";
import { INITIAL_GLOBAL_STATE } from "./Global/initializeGlobalState";

// What reaches the transport is what Sentry would send over the network.
// Only Sentry.init is wrapped (to swap in this fake transport) and
// showReportDialog is replaced (it would inject a script from sentry.io).
// The rest of @sentry/react is the real SDK, so the event processors,
// beforeSend and the envelope are the ones production runs.
const sent = vi.hoisted(() => ({ envelopes: [] as unknown[] }));
const showReportDialog = vi.hoisted(() => vi.fn());
// The real showReportDialog, for the one test that checks the SDK's side.
const realSdk = vi.hoisted(() => ({
  showReportDialog: undefined as unknown as (options: Record<string, unknown>) => void,
}));

vi.mock("@sentry/react", async (importOriginal) => {
  const real = await importOriginal<typeof import("@sentry/react")>();
  realSdk.showReportDialog = real.showReportDialog;
  const fakeTransport = () => ({
    send: async (envelope: unknown) => {
      sent.envelopes.push(envelope);
      return {};
    },
    flush: async () => true,
  });
  return {
    ...real,
    init: (options: Parameters<typeof real.init>[0]) =>
      real.init({ ...options, transport: fakeTransport } as Parameters<typeof real.init>[0]),
    showReportDialog,
  };
});

import { initSentry, Sentry } from "./initSentry";

type SentEvent = {
  event_id: string;
  message?: string;
  exception?: { values: { value: string }[] };
  contexts: Record<string, Record<string, unknown>>;
};

// An envelope is [headers, [[itemHeader, payload], ...]]. Pick the error events.
const sentEvents = (): SentEvent[] =>
  (sent.envelopes as [unknown, [{ type: string }, SentEvent][]][]).flatMap(([, items]) =>
    items.filter(([header]) => header.type === "event").map(([, payload]) => payload)
  );

// The one event sent since the last reset (fails the test if there are 0 or 2+).
const theSentEvent = (): SentEvent => {
  const events = sentEvents();
  expect(events).toHaveLength(1);
  return events[0] as SentEvent;
};
const dialogOptions = (): Record<string, unknown> => {
  expect(showReportDialog).toHaveBeenCalledTimes(1);
  return showReportDialog.mock.calls[0]?.[0] as Record<string, unknown>;
};

describe("initSentry: what is sent to Sentry", () => {
  beforeAll(() => {
    setGlobal({
      ...INITIAL_GLOBAL_STATE,
      itemStore: { k1: {}, k2: {}, k3: {} },
      drawOrder: ["k1", "k2"],
    } as never);
    initSentry();
  });
  beforeEach(() => {
    sent.envelopes.length = 0;
    showReportDialog.mockClear();
  });

  test("an exception is sent with the kozaneba and device contexts, and opens the report dialog", async () => {
    Sentry.captureException(new Error("boom-for-test"));
    await Sentry.flush(2000);

    const event = theSentEvent();
    expect(event.exception?.values[0]?.value).toBe("boom-for-test");
    expect(event.contexts.kozaneba).toEqual({
      dialog: "",
      status: "no-connection",
      signed_in: false,
      is_cloud: false,
      is_local_change: false,
      num_items: 3,
      num_top_level: 2,
      scale: 1,
    });
    expect(event.contexts.device).toMatchObject({
      max_touch_points: expect.any(Number),
      pointer_coarse: expect.any(Boolean),
      viewport: expect.stringMatching(/^\d+x\d+$/),
    });

    expect(dialogOptions()).toMatchObject({ eventId: event.event_id, lang: "en" });
  });

  test("Manual Feedback is sent with the contexts and opens the feedback dialog", async () => {
    Sentry.captureMessage("Manual Feedback 123");
    await Sentry.flush(2000);

    const event = theSentEvent();
    expect(event.message).toBe("Manual Feedback 123");
    expect(event.contexts.kozaneba).toMatchObject({ num_items: 3 });
    expect(event.contexts.device).toMatchObject({ viewport: expect.any(String) });
    expect(dialogOptions()).toMatchObject({ eventId: event.event_id, title: "Feedback" });
  });

  test("other messages are sent with the contexts but open no dialog", async () => {
    Sentry.captureMessage("Click on nothing");
    await Sentry.flush(2000);

    const event = theSentEvent();
    expect(event.contexts.kozaneba).toMatchObject({ num_top_level: 2 });
    expect(showReportDialog).not.toHaveBeenCalled();
  });

  // Hot keys are turned off only while a dialog is open, and turned back on
  // when it closes. The SDK (v7 and v11) calls `onClose`, not `onclose`.
  test("an event that opens no dialog leaves hot keys on", async () => {
    await setGlobal({ disableHotKey: false });
    // Not "Click on nothing" again: Dedupe drops a repeat of the last event.
    Sentry.captureMessage("drag_drop_item_into_group: target_id === group_id");
    await Sentry.flush(2000);

    theSentEvent();
    expect(showReportDialog).not.toHaveBeenCalled();
    expect(getGlobal().disableHotKey).toBe(false);
  });

  test("the report dialog turns hot keys off, and closing it (onClose) turns them back on", async () => {
    await setGlobal({ disableHotKey: false });
    Sentry.captureException(new Error("boom-for-close"));
    await Sentry.flush(2000);

    const options = dialogOptions();
    expect(getGlobal().disableHotKey).toBe(true);
    expect(options.onclose).toBeUndefined();
    expect(typeof options.onClose).toBe("function");

    await (options.onClose as () => unknown)();
    expect(getGlobal().disableHotKey).toBe(false);
  });

  test("the feedback dialog also turns hot keys back on when closed", async () => {
    await setGlobal({ disableHotKey: false });
    Sentry.captureMessage("Manual Feedback 456");
    await Sentry.flush(2000);

    const options = dialogOptions();
    expect(options).toMatchObject({ title: "Feedback" });
    expect(getGlobal().disableHotKey).toBe(true);

    await (options.onClose as () => unknown)();
    expect(getGlobal().disableHotKey).toBe(false);
  });

  // The two tests above call onClose themselves. This one gives the same
  // options to the SDK's own showReportDialog and sends the message the
  // dialog iframe posts when it closes, so it checks which name the SDK calls.
  test("the SDK's report dialog calls our close handler when the dialog closes", async () => {
    await setGlobal({ disableHotKey: false });
    Sentry.captureException(new Error("boom-for-sdk-close"));
    await Sentry.flush(2000);
    const options = dialogOptions();
    expect(getGlobal().disableHotKey).toBe(true);

    realSdk.showReportDialog(options);
    window.dispatchEvent(new MessageEvent("message", { data: "__sentry_reportdialog_closed__" }));
    await vi.waitFor(() => expect(getGlobal().disableHotKey).toBe(false));
  });
});
