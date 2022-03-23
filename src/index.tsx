import React from "react";
import ReactDOM from "react-dom";
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
import { ThemeProvider } from "@mui/material";

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

if (process.env.NODE_ENV !== "production") {
  initDevelopment();
} else {
  initProduction();
}

expose_kozaneba_api();
run_user_script();

ReactDOM.render(
  //  <React.StrictMode>  // Material-UI is not support it
  <ThemeProvider theme="">
    <App />
  </ThemeProvider>,
  //  </React.StrictMode>
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
