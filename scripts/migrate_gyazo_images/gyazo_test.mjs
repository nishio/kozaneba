import assert from "node:assert/strict";
import { test } from "node:test";
import { download_url, extension_of, find_gyazo_items, gyazo_id_of } from "./gyazo.mjs";

const ID = "8ff159b59dab5e5e600faa314eafda28";

test("gyazo_id_of reads every Gyazo URL form", () => {
  for (const url of [
    `https://gyazo.com/${ID}`,
    `https://gyazo.com/${ID}/thumb/400`,
    `https://gyazo.com/${ID}/raw`,
    `https://i.gyazo.com/${ID}.png`,
    `https://i.gyazo.com/thumb/400/${ID}-png.png`,
  ]) {
    assert.equal(gyazo_id_of(url), ID, url);
  }
});

test("gyazo_id_of ignores other hosts and broken URLs", () => {
  assert.equal(gyazo_id_of(`https://example.com/${ID}.png`), null);
  assert.equal(gyazo_id_of("https://gyazo.com/"), null);
  assert.equal(gyazo_id_of("not a url"), null);
});

test("extension_of maps image types only", () => {
  assert.equal(extension_of("image/png"), "png");
  assert.equal(extension_of("image/jpeg; charset=binary"), "jpg");
  assert.equal(extension_of("image/gif"), "gif");
  assert.equal(extension_of("text/html; charset=utf-8"), null);
  assert.equal(extension_of(undefined), null);
});

test("find_gyazo_items picks Gyazo image items only", () => {
  const doc = {
    itemStore: {
      a: { type: "gyazo", url: `https://gyazo.com/${ID}` },
      b: { type: "gyazo", url: "https://example.com/x.png" },
      c: { type: "kozane", text: `https://gyazo.com/${ID}` },
      d: { type: "scrapbox", image: `https://gyazo.com/${ID}` },
    },
  };
  assert.deepEqual(find_gyazo_items(doc), [
    { item_id: "a", url: `https://gyazo.com/${ID}`, gyazo_id: ID },
  ]);
  assert.deepEqual(find_gyazo_items({}), []);
});

test("download_url encodes the path", () => {
  assert.equal(
    download_url("https://firebasestorage.googleapis.com", "b", "images/u/gyazo-x.png", "t"),
    "https://firebasestorage.googleapis.com/v0/b/b/o/images%2Fu%2Fgyazo-x.png?alt=media&token=t"
  );
});
