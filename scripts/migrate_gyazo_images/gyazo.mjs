// Pure helpers, kept apart from migrate.mjs so they can be tested without
// Firebase.

const GYAZO_HOSTS = new Set(["gyazo.com", "i.gyazo.com"]);
const GYAZO_ID = /[0-9a-f]{32}/;

// Returns the Gyazo image id of a gyazo.com / i.gyazo.com URL, or null.
//   https://gyazo.com/<id>
//   https://gyazo.com/<id>/thumb/400, https://gyazo.com/<id>/raw
//   https://i.gyazo.com/<id>.png
//   https://i.gyazo.com/thumb/400/<id>-png.png
export const gyazo_id_of = (url) => {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!GYAZO_HOSTS.has(parsed.hostname)) return null;
  const match = parsed.pathname.match(GYAZO_ID);
  return match ? match[0] : null;
};

const EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

export const extension_of = (content_type) => {
  const type = (content_type ?? "").split(";")[0].trim().toLowerCase();
  return EXTENSIONS[type] ?? null;
};

// Image items whose url points to Gyazo, from a Ba document.
// Returns [{ item_id, url, gyazo_id }].
export const find_gyazo_items = (doc) => {
  const result = [];
  const store = doc?.itemStore;
  if (store === null || typeof store !== "object") return result;
  for (const [item_id, item] of Object.entries(store)) {
    if (item?.type !== "gyazo" || typeof item.url !== "string") continue;
    const gyazo_id = gyazo_id_of(item.url);
    if (gyazo_id !== null) result.push({ item_id, url: item.url, gyazo_id });
  }
  return result;
};

export const download_url = (base, bucket, path, token) =>
  `${base}/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
