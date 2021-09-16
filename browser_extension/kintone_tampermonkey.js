// ==UserScript==
// @name         from kintone to kozaneba
// @namespace    http://nishiohirokazu.org/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*.cybozu.com/k/*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  console.log("start");
  const button = document.createElement("button");
  button.className = "gaia-argoui-app-subtotalbutton";
  const init_image = () => {
    button.style.backgroundImage =
      "url(https://kozaneba.netlify.app/kozaneba.png)";
    button.style.backgroundSize = "cover";
  };
  init_image();

  document
    .querySelector(".gaia-argoui-app-subtotalbutton")
    .insertAdjacentElement("afterend", button);
  button.addEventListener("click", () => {
    const drawOrder = [];
    const itemStore = {};

    document.querySelectorAll("tr").forEach((row, index) => {
      const cols = row.querySelectorAll("td");
      console.log(cols);
      console.log(cols[0]);
      const url = cols[0].querySelector("a").href;
      const id = url.match(/record=(\d+)/)[1];
      console.log(cols[1]);
      const text = cols[1].querySelector("span").innerText;
      const x = (index % 10) * 131;
      const y = Math.floor(index / 10) * 101;
      itemStore[id] = {
        type: "kozane",
        text,
        position: [x, y],
        id,
        scale: 1,
        custom: { url },
      };
      drawOrder.push(id);
    });
    console.log(drawOrder);
    // spinner
    button.style.backgroundImage =
      "url(https://kozaneba.netlify.app/spinner.gif)";
    button.style.backgroundSize = "auto";

    fetch("https://us-central1-regroup-d4932.cloudfunctions.net/create_ba", {
      method: "post",
      body: JSON.stringify({
        itemStore,
        drawOrder,
        last_updated: Date.now(),
      }),
      mode: "cors",
    })
      .then((res) => res.json())
      .then(({ cloud_ba }) => {
        init_image();
        window.open(`https://kozaneba.netlify.app/#edit=${cloud_ba}`);
      });
  });
  //gaia-argoui-app-subtotalbutton
  console.log("ok");
})();
