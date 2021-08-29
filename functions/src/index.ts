import * as functions from "firebase-functions";
import fetch from "node-fetch";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

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
