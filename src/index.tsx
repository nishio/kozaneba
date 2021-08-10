import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App/App";
import reportWebVitals from "./reportWebVitals";
import { INITIAL_GLOBAL_STATE } from "./Global/initializeGlobalState";
import { getGlobal, setGlobal } from "reactn";
import { exposeGlobal } from "./Global/exposeGlobal";

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
      if (
        (event.exception || event.message === "Manual Bug Report") &&
        !shownReportDialog
      ) {
        shownReportDialog = true;
        Sentry.showReportDialog({ eventId: event.event_id });
      }
      Sentry.setContext("saveData", getGlobal());

      return event;
    },
  });
};
let shownReportDialog = false;
export { Sentry };

const initProduction = () => {
  initSentry();
  setGlobal({ show_devmenu: false });
};

const initDevelopment = () => {
  exposeGlobal();
  // addReactNDevTools({ trace: true, traceLimit: 25 });
};

setGlobal(INITIAL_GLOBAL_STATE);

if (process.env.NODE_ENV !== "production") {
  initDevelopment();
} else {
  initProduction();
}

ReactDOM.render(
  //  <React.StrictMode>  // Material-UI is not support it
  <App />,
  //  </React.StrictMode>
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
