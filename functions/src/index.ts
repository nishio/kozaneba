import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
// const { KintoneRestAPIClient } = require("@kintone/rest-api-client");

admin.initializeApp();

const SCRAPBOX_ORIGIN = "https://scrapbox.io";

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const parseJsonBody = (body: unknown): Record<string, unknown> | null => {
  if (Buffer.isBuffer(body)) {
    return parseJsonBody(body.toString("utf8"));
  }

  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      return isObject(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return isObject(body) ? body : null;
};

const encodeUrlPathPart = (pathPart: string): string | null => {
  try {
    return encodeURIComponent(decodeURIComponent(pathPart));
  } catch {
    return null;
  }
};

const makeScrapboxApiUrl = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.hostname !== "scrapbox.io") {
    return null;
  }

  const pathParts = url.pathname.split("/").filter((x) => x !== "");
  if (pathParts.length < 2) {
    return null;
  }

  const encodedParts: string[] = [];
  for (const pathPart of pathParts) {
    const encodedPathPart = encodeUrlPathPart(pathPart);
    if (encodedPathPart === null) {
      return null;
    }
    encodedParts.push(encodedPathPart);
  }

  return new URL(`/api/pages/${encodedParts.join("/")}`, SCRAPBOX_ORIGIN).href;
};

export const get_scrapbox_page = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({error: "method not allowed"});
    return;
  }

  const body = parseJsonBody(req.body);
  const apiUrl = makeScrapboxApiUrl(body?.url);
  if (apiUrl === null) {
    res.status(400).json({error: "invalid scrapbox page url"});
    return;
  }

  fetch(apiUrl)
      .then((response) => response.text())
      .then((text) => {
        res.send(text);
      })
      .catch((error) => {
        res.status(502).json({error: String(error)});
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

  res.status(410).json({error: "proxy is disabled"});
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
