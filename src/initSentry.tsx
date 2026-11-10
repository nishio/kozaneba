import { getGlobal, setGlobal } from "reactn";
import * as Sentry from "@sentry/react";
import { device_context, sentry_context } from "./sentry_context";

const CONFIG = {
  labelName: "NAME (optional)",
  labelEmail: "EMAIL (optional)",
  user: { name: "No Name", email: "foo@example.com" },
  labelComments: "COMMENT (the developer can read both Japanese and English)",
  lang: "en",
  onLoad: () => {
    const t = document.getElementById("id_comments") as HTMLTextAreaElement;
    t.placeholder = "";
  },
  // The SDK calls `onClose` (it never called `onclose`, which left hot keys
  // off after the dialog closed).
  onClose: () => setGlobal({ disableHotKey: false }),
};
const CONFIG_FOR_FEEDBACK = {
  title: "Feedback",
  subtitle: "We appreciate your comment and feedback!",
  subtitle2: "Your feedback helps kozaneba glow",
  labelSubmit: "Submit Feedback",
};

export const initSentry = () => {
  Sentry.init({
    dsn: "https://c16fb727f35a4fb7bf8c7bb5899ca35b@o376998.ingest.sentry.io/5898295",
    integrations: [Sentry.browserTracingIntegration()],

    // v8 made attachStacktrace default to true, which puts a synthetic
    // `exception` on every captureMessage event. beforeSend below tells an
    // exception from a message by `event.exception`, so keep the v7 default:
    // otherwise "Click on nothing" would open the error report dialog and
    // Manual Feedback would open it without the feedback labels.
    attachStacktrace: false,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,

    beforeSend(event, hint) {
      // Hot keys are off only while a report dialog is open (CONFIG.onClose
      // turns them back on), so events that open no dialog leave them on.
      // Check if it is an exception, and if so, show the report dialog
      if (event.exception) {
        setGlobal({ disableHotKey: true });
        Sentry.showReportDialog({
          eventId: event.event_id,
          ...CONFIG,
        });
      } else if (event.message?.includes("Manual Feedback")) {
        setGlobal({ disableHotKey: true });
        Sentry.showReportDialog({
          eventId: event.event_id,
          ...CONFIG,
          ...CONFIG_FOR_FEEDBACK,
        });
      }

      return event;
    },
  });
  // An event processor runs before the event is sent, so the context belongs
  // to this event (setContext in beforeSend only reached the next one).
  // v8 removed addGlobalEventProcessor; the global scope's processors run for
  // every event, as the old global processor did.
  Sentry.getGlobalScope().addEventProcessor((event) => {
    event.contexts = {
      ...event.contexts,
      kozaneba: sentry_context(getGlobal()),
      device: { ...event.contexts?.device, ...device_context() },
    };
    return event;
  });
};
export { Sentry };
