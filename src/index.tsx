import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { INITIAL_GLOBAL_STATE } from "./initializeGlobalState";
import { createProvider } from "reactn";

const Provider = createProvider(INITIAL_GLOBAL_STATE);

const movidea = {
  getGlobal: Provider.getGlobal,
  setGlobal: Provider.setGlobal,
  Provider,
  foo: () => {
    console.log("foo start");
    Provider.setGlobal({ fusens: [{ text: "1", x: 0, y: 0 }] });
    console.log("foo end");
  },
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
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
