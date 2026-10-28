import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App/App";
import reportWebVitals from "./reportWebVitals";
import { INITIAL_GLOBAL_STATE } from "./Global/initializeGlobalState";
import { setGlobal } from "reactn";
import { exposeGlobalForTest } from "./Global/exposeGlobal";

import { initSentry } from "./initSentry";
import { initGoogleAnalytics } from "./initGoogleAnalytics";
import addReactNDevTools from "reactn-devtools";
import { run_user_script } from "./API/run_user_script";
import { expose_kozaneba_api } from "./API/KozanebaAPI";
import { dev_log } from "./utils/dev";
import { install_recorder, is_record_requested, is_sample_requested } from "./Recorder/recorder";
import { load_sample_board } from "./Recorder/sample_board";
import { snapshot } from "./Recorder/snapshot";
import { updateGlobal } from "./Global/updateGlobal";
import { getGlobal } from "reactn";

const initProduction = () => {
  initSentry();
  setGlobal({ show_devmenu: false });
  initGoogleAnalytics();
};

const initDevelopment = () => {
  exposeGlobalForTest();
  addReactNDevTools({ trace: true, traceLimit: 25 });
  window.gtag = () => {};
};

setGlobal(INITIAL_GLOBAL_STATE);

if (import.meta.env.DEV) {
  initDevelopment();
} else {
  initProduction();
}

// Touch session recorder (`#blank&record=sample`), and a read-only snapshot
// hook that the replay harness uses on the dev server.
if (is_record_requested()) {
  if (is_sample_requested()) updateGlobal(load_sample_board);
  install_recorder();
}
if (import.meta.env.DEV || is_record_requested()) {
  window.__kozaneba_snapshot = () => snapshot(getGlobal());
}

expose_kozaneba_api();
run_user_script();

window.matchMedia("print").addEventListener("change", (e) => {
  dev_log(e);
  setGlobal({
    print_mode: e.matches,
  });
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);
root.render(
  //  <React.StrictMode>  // Material-UI is not support it
  // <ThemeProvider theme="normal">
  <App />
  // </ThemeProvider>,
  //  </React.StrictMode>
);

reportWebVitals();
