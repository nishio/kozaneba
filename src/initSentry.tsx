import { getGlobal } from "reactn";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

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
      if (event.exception || event.message === "Manual Bug Report") {
        Sentry.showReportDialog({
          eventId: event.event_id,
          labelName: "NAME (optional)",
          labelEmail: "EMAIL (optional)",
          user: { name: "No Name", email: "foo@example.com" },
          labelComments:
            "COMMENT (the developer can read both Japanese and English)",
          lang: "en",
          onLoad: () => {
            const t = document.getElementById(
              "id_comments"
            ) as HTMLTextAreaElement;
            t.placeholder = "";
          },
        });
      }
      Sentry.setContext("global", getGlobal());

      return event;
    },
  });
};
export { Sentry };
