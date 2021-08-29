import * as functions from "firebase-functions";
import fetch from "node-fetch";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const get_scrapbox_page = functions.https.onRequest(
  (request, response) => {
    const body = JSON.parse(request.body);
    const url = body.url;
    const api_url = url.replace("scrapbox.io/", "scrapbox.io/api/pages/");
    fetch(api_url).then((req) => {
      req.text().then((text) => {
        response.send(text);
      });
    });
  }
);
