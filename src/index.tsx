import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App/App";
import reportWebVitals from "./reportWebVitals";
import { INITIAL_GLOBAL_STATE } from "./Global/initializeGlobalState";
import { setGlobal } from "reactn";
import { exposeGlobal } from "./Global/exposeGlobal";

import { auth } from "./Cloud/FirestoreIO";
import { initSentry } from "./initSentry";

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
