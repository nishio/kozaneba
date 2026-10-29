// One-off: copy the Gyazo images on your own Ba to Firebase Storage and point
// the image items at the copies. See README.md.
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { initializeApp } from "firebase-admin/app";
import { FieldPath, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { download_url, extension_of, find_gyazo_items } from "./gyazo.mjs";

const NISHIO_UID = "X4csZggYy1dAhcilL1FyNfjBJj12";

const { values: args } = parseArgs({
  options: {
    uid: { type: "string", default: NISHIO_UID },
    project: { type: "string", default: "regroup-d4932" },
    bucket: { type: "string", default: "regroup-d4932.firebasestorage.app" },
    ba: { type: "string" },
    apply: { type: "boolean", default: false },
    out: { type: "string", default: "out" },
  },
});

initializeApp({ projectId: args.project, storageBucket: args.bucket });
const db = getFirestore();
const bucket = getStorage().bucket();
const storage_base = process.env.FIREBASE_STORAGE_EMULATOR_HOST
  ? `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}`
  : "https://firebasestorage.googleapis.com";

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const out_dir = `${args.out}/${stamp}`;
mkdirSync(`${out_dir}/backup`, { recursive: true });

// Same Gyazo image -> same Storage file, also across runs.
const copied = new Map();

const copy_to_storage = async (gyazo_id) => {
  if (copied.has(gyazo_id)) return copied.get(gyazo_id);
  const promise = (async () => {
    const res = await fetch(`https://gyazo.com/${gyazo_id}/raw`);
    if (!res.ok) throw new Error(`Gyazo returned ${res.status}`);
    const content_type = res.headers.get("content-type");
    const ext = extension_of(content_type);
    if (ext === null) throw new Error(`not an image: ${content_type}`);
    const path = `images/${args.uid}/gyazo-${gyazo_id}.${ext}`;
    const file = bucket.file(path);
    const [exists] = await file.exists();
    let token;
    if (exists) {
      const [metadata] = await file.getMetadata();
      token = metadata.metadata?.firebaseStorageDownloadTokens?.split(",")[0];
    }
    if (token === undefined) {
      token = randomUUID();
      await file.save(Buffer.from(await res.arrayBuffer()), {
        contentType: content_type,
        metadata: { metadata: { firebaseStorageDownloadTokens: token } },
      });
    } else {
      await res.body?.cancel();
    }
    return download_url(storage_base, bucket.name, path, token);
  })();
  copied.set(gyazo_id, promise);
  return promise;
};

const migrate_ba = async (snap, report) => {
  const data = snap.data();
  const targets = find_gyazo_items(data);
  const entry = {
    ba: snap.id,
    title: data.title ?? "",
    items: targets.length,
    migrated: 0,
    skipped: 0,
    failed: [],
  };
  report.push(entry);
  console.log(`${snap.id} "${entry.title}": ${targets.length} Gyazo images`);
  if (!args.apply || targets.length === 0) return;

  writeFileSync(`${out_dir}/backup/${snap.id}.json`, JSON.stringify(data));

  const new_urls = new Map();
  for (const t of targets) {
    try {
      new_urls.set(t.item_id, { old: t.url, url: await copy_to_storage(t.gyazo_id) });
    } catch (error) {
      entry.failed.push({ item_id: t.item_id, url: t.url, error: String(error.message ?? error) });
      console.log(`  failed ${t.url}: ${error.message ?? error}`);
    }
  }
  if (new_urls.size === 0) return;

  // Only rewrite items that still have the URL we copied, in case someone
  // edited the Ba meanwhile. Bumping last_updated makes open clients take the
  // new state instead of overwriting it with their old one.
  await db.runTransaction(async (tx) => {
    const ref = snap.ref;
    const fresh = (await tx.get(ref)).data();
    const updates = [];
    for (const [item_id, { old, url }] of new_urls) {
      const item = fresh?.itemStore?.[item_id];
      if (item?.url !== old) {
        entry.skipped++;
        continue;
      }
      updates.push(new FieldPath("itemStore", item_id, "url"), url);
      updates.push(new FieldPath("itemStore", item_id, "text"), `[${url}]`);
      entry.migrated++;
    }
    if (updates.length === 0) return;
    const last_updated = Math.max(Date.now(), (fresh.last_updated ?? 0) + 1);
    tx.update(ref, new FieldPath("last_updated"), last_updated, ...updates);
  });
  console.log(`  migrated ${entry.migrated}, skipped ${entry.skipped}, failed ${entry.failed.length}`);
};

const main = async () => {
  console.log(args.apply ? "APPLY" : "DRY RUN (pass --apply to migrate)");
  const snaps = args.ba
    ? [await db.collection("ba").doc(args.ba).get()]
    : (await db.collection("ba").where("writers", "array-contains", args.uid).get()).docs;
  const report = [];
  for (const snap of snaps) {
    if (!snap.exists) {
      console.log(`${snap.id}: not found`);
      continue;
    }
    if (args.ba && !(snap.data().writers ?? []).includes(args.uid)) {
      console.log(`${snap.id}: ${args.uid} is not a writer, skipped`);
      continue;
    }
    await migrate_ba(snap, report);
  }
  const total = (key) => report.reduce((n, e) => n + (Array.isArray(e[key]) ? e[key].length : e[key]), 0);
  const with_images = report.filter((e) => e.items > 0).length;
  console.log(
    `\n${report.length} Ba, ${with_images} with Gyazo images, ${total("items")} items` +
      (args.apply ? `: migrated ${total("migrated")}, skipped ${total("skipped")}, failed ${total("failed")}` : "")
  );
  writeFileSync(`${out_dir}/report.json`, JSON.stringify(report, null, 2));
  console.log(`report: ${out_dir}/report.json`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
