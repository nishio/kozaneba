import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { INITIAL_GLOBAL_STATE } from "./initializeGlobalState";
import { getGlobal, setGlobal } from "reactn";
import { importRegroupJSON } from "./importRegroupJSON";
import { updateGlobal } from "./updateGlobal";

setGlobal(INITIAL_GLOBAL_STATE);
const movidea = {
  getGlobal,
  setGlobal,
  updateGlobal,
  importRegroupJSON,
};

const debug = {};

declare global {
  interface Window {
    debug: any;
    movidea: typeof movidea;
  }
}

window.movidea = movidea;
window.debug = debug;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
