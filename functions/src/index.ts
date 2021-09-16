import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
// const { KintoneRestAPIClient } = require("@kintone/rest-api-client");

admin.initializeApp();

export const get_scrapbox_page = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  const body = JSON.parse(req.body);
  const url = body.url;
  const api_url = url.replace("scrapbox.io/", "scrapbox.io/api/pages/");
  fetch(api_url).then((req) => {
    req.text().then((text) => {
      res.send(text);
    });
  });
});

export const proxy = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    // Send response to preflight OPTIONS requests
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  const body = JSON.parse(req.body);
  const url = body.url;
  const method = req.method;
  const fetch_param = {
    ...body,
    method,
  };
  fetch(url, fetch_param).then((req) => {
    req.text().then((text) => {
      res.send(text);
    });
  });
});

// export const kintone_get = functions.https.onRequest((req, res) => {
//   res.set("Access-Control-Allow-Origin", "*");

//   if (req.method === "OPTIONS") {
//     // Send response to preflight OPTIONS requests
//     res.set("Access-Control-Allow-Methods", "GET");
//     res.set("Access-Control-Allow-Headers", "Content-Type");
//     res.set("Access-Control-Max-Age", "3600");
//     res.status(204).send("");
//     return;
//   }

//   const body = JSON.parse(req.body);
//   const { baseUrl, apiToken, app } = body;
//   const client = new KintoneRestAPIClient({
//     baseUrl,
//     auth: { apiToken },
//   });
//   client.record.getRecords({ app }).then((resp: any) => {
//     res.send(JSON.stringify(resp.records));
//   });
// });

export const create_ba = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  const state = JSON.parse(req.body);
  const {
    itemStore,
    drawOrder,
    last_updated = 0,
    anyone_writable = true,
    title = "",
    writers = [],
    annotations = [],
  } = state;
  const docdata = {
    version: 3,
    itemStore,
    drawOrder,
    last_updated,
    anyone_writable,
    title,
    writers,
    annotations,
  };
  const writeResult = await admin.firestore().collection("ba").add(docdata);
  res.json({
    cloud_ba: writeResult.id,
  });
});

// const sample = () => {
//   fetch("http://localhost:5001/regroup-d4932/us-central1/create_ba", {
//     method: "post",
//     body: JSON.stringify({
//       itemStore: {
//         "1": {
//           type: "kozane",
//           text: "Hello!",
//           position: [0, 0],
//           id: "1",
//           scale: 1,
//         },
//       },
//       drawOrder: ["1"],
//     }),
//   }).then(console.log);
// };
