import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App/App";
import reportWebVitals from "./reportWebVitals";
import { INITIAL_GLOBAL_STATE } from "./Global/initializeGlobalState";
// Import from our compatibility layer instead of reactn
import { setGlobal, GlobalProvider } from "./Global/ReactnCompat";
import { exposeGlobalForTest } from "./Global/exposeGlobal";

import { initSentry } from "./initSentry";
import { initGoogleAnalytics } from "./initGoogleAnalytics";
// TODO: Implement custom dev tools for React Context API
import { run_user_script } from "./API/run_user_script";
import { expose_kozaneba_api } from "./API/KozanebaAPI";

const initProduction = () => {
  initSentry();
  setGlobal({ show_devmenu: false });
  initGoogleAnalytics();
};

const initDevelopment = () => {
  exposeGlobalForTest();
  // Dev tools removed as part of reactn migration
  window.gtag = () => {};
};

setGlobal(INITIAL_GLOBAL_STATE);

if (process.env.NODE_ENV !== "production") {
  initDevelopment();
} else {
  initProduction();
}

expose_kozaneba_api();
run_user_script();

window.matchMedia("print").addEventListener("change", (e) => {
  console.log(e);
  setGlobal({
    print_mode: e.matches,
  });
});

// React 18 uses createRoot instead of ReactDOM.render
const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = createRoot(container);

root.render(
  //  <React.StrictMode>  // Material-UI is not support it
  // <ThemeProvider theme="normal">
  <GlobalProvider>
    <App />
  </GlobalProvider>
  // </ThemeProvider>,
  //  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
