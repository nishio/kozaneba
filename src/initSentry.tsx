import { getGlobal } from "reactn";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

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
    integrations: [new Integrations.BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,

    beforeSend(event, hint) {
      // Check if it is an exception, and if so, show the report dialog
      console.log(event);
      if (event.exception) {
        Sentry.showReportDialog({
          eventId: event.event_id,
          ...CONFIG,
        });
      } else if (event.message?.includes("Manual Feedback")) {
        Sentry.showReportDialog({
          eventId: event.event_id,
          ...CONFIG,
          ...CONFIG_FOR_FEEDBACK,
        });
      }
      Sentry.setContext("global", getGlobal());

      return event;
    },
  });
};
export { Sentry };
