import * as functions from "firebase-functions";
import fetch from "node-fetch";
const { KintoneRestAPIClient } = require("@kintone/rest-api-client");

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

export const kintone_get = functions.https.onRequest((req, res) => {
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
  const { baseUrl, apiToken, app } = body;
  const client = new KintoneRestAPIClient({
    baseUrl,
    auth: { apiToken },
  });
  client.record.getRecords({ app }).then((resp: any) => {
    res.send(JSON.stringify(resp.records));
  });
});
