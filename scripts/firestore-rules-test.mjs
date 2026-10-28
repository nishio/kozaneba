// Checks firestore.rules against the Firestore emulator.
// Run: npm run test:rules  (starts the emulator via firebase emulators:exec)
import assert from "node:assert/strict";
import { initializeApp, deleteApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  collection,
  setDoc,
  where,
} from "firebase/firestore";

const PROJECT_ID = process.env.GCLOUD_PROJECT ?? "demo-rules";
const [HOST, PORT] = (process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080").split(":");
const apps = [];

const client = (uid) => {
  const app = initializeApp({ projectId: PROJECT_ID }, `app-${uid ?? "anon"}-${apps.length}`);
  apps.push(app);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, HOST, Number(PORT), uid ? { mockUserToken: { sub: uid, user_id: uid } } : {});
  return db;
};

const ba = (writers, anyone_writable = true, extra = {}) => ({
  version: 3,
  itemStore: {},
  drawOrder: [],
  last_updated: 1,
  anyone_writable,
  title: "t",
  writers,
  annotations: [],
  ...extra,
});

// Every check runs and each failure is listed, so a run against older rules
// shows all the cases they get wrong.
const failures = [];
const allowed = async (name, p) => {
  try {
    await p;
  } catch (e) {
    failures.push(name);
    console.log(`FAIL allowed: ${name} (got ${e.code ?? e})`);
    return;
  }
  console.log(`ok   allowed: ${name}`);
};
const denied = async (name, p) => {
  try {
    await p;
  } catch (e) {
    if (e.code === "permission-denied") {
      console.log(`ok   denied:  ${name}`);
    } else {
      failures.push(name);
      console.log(`FAIL denied:  ${name} (got ${e.code ?? e})`);
    }
    return;
  }
  failures.push(name);
  console.log(`FAIL denied:  ${name} (was allowed)`);
};

// Writes a doc with rules bypassed (emulator admin access), for shapes a
// client can no longer create, e.g. the writers: [] of create_ba.
const seed = async (id, data) => {
  const v = (x) =>
    typeof x === "string" ? { stringValue: x }
    : typeof x === "boolean" ? { booleanValue: x }
    : typeof x === "number" ? { integerValue: String(x) }
    : Array.isArray(x) ? { arrayValue: { values: x.map(v) } }
    : { mapValue: { fields: Object.fromEntries(Object.entries(x).map(([k, y]) => [k, v(y)])) } };
  const url = `http://${HOST}:${PORT}/v1/projects/${PROJECT_ID}/databases/(default)/documents/ba/${id}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: "Bearer owner", "Content-Type": "application/json" },
    body: JSON.stringify({ fields: v(data).mapValue.fields }),
  });
  assert.ok(res.ok, `seed ${id}: ${res.status} ${await res.text()}`);
};

const anon = client(null);
const owner = client("owner");
const other = client("other");
const coeditor = client("coeditor");

// create
await denied("unauth create", setDoc(doc(anon, "ba", "x0"), ba([])));
await denied("create with someone else as writer", setDoc(doc(other, "ba", "x1"), ba(["owner"])));
await denied("create with extra writer", setDoc(doc(other, "ba", "x2"), ba(["other", "owner"])));
await denied("create with unknown field", setDoc(doc(owner, "ba", "x3"), ba(["owner"], true, { evil: 1 })));
await allowed("owner creates public ba", setDoc(doc(owner, "ba", "pub"), ba(["owner"], true)));
await allowed("owner creates private ba", setDoc(doc(owner, "ba", "priv"), ba(["owner"], false)));
await allowed("create with scrapbox field", setDoc(doc(owner, "ba", "sb"), ba(["owner"], true, { scrapbox: "nishio" })));

// read
await allowed("unauth get", getDoc(doc(anon, "ba", "priv")));
await allowed("writer lists own ba", getDocs(query(collection(owner, "ba"), where("writers", "array-contains", "owner"))));
await denied("list someone else's ba", getDocs(query(collection(other, "ba"), where("writers", "array-contains", "owner"))));

// update of a public (anyone_writable) ba
await denied("unauth edits public ba", setDoc(doc(anon, "ba", "pub"), ba(["owner"], true, { title: "u" })));
await denied("takeover: make private", setDoc(doc(other, "ba", "pub"), ba(["owner", "other"], false)));
await denied("takeover: replace writers", setDoc(doc(other, "ba", "pub"), ba(["other"], true)));
await denied("takeover: put self first", setDoc(doc(other, "ba", "pub"), ba(["other", "owner"], true)));
await denied("add a third person as writer", setDoc(doc(other, "ba", "pub"), ba(["owner", "other", "x"], true)));
await allowed("signed-in user edits public ba and joins writers", setDoc(doc(other, "ba", "pub"), ba(["owner", "other"], true, { title: "e" })));
await denied("non-owner writer makes it private", setDoc(doc(other, "ba", "pub"), ba(["owner", "other"], false)));
await denied("non-owner writer removes owner", setDoc(doc(other, "ba", "pub"), ba(["other"], true)));
await denied("non-owner writer deletes", deleteDoc(doc(other, "ba", "pub")));
await denied("unauth deletes", deleteDoc(doc(anon, "ba", "pub")));
await allowed("owner makes it private", setDoc(doc(owner, "ba", "pub"), ba(["owner", "other"], false)));
await allowed("existing writer still edits private ba", setDoc(doc(other, "ba", "pub"), ba(["owner", "other"], false, { title: "w" })));

// update of a private ba
await denied("non-writer edits private ba", setDoc(doc(coeditor, "ba", "priv"), ba(["owner", "coeditor"], false)));
await allowed("owner edits private ba", setDoc(doc(owner, "ba", "priv"), ba(["owner"], false, { title: "o" })));
await allowed("owner makes it public", setDoc(doc(owner, "ba", "priv"), ba(["owner"], true)));

// writers only grows by the requesting user themself, for the owner too
// (a writer cannot be pushed into someone else's "Ba which you can write"
// list, and writers[0] never moves). Each case starts from a fresh doc so a
// wrongly allowed write does not change the next case.
const w1 = async () => { await seed("w", ba(["owner"], true)); return doc(owner, "ba", "w"); };
const w2 = async () => { await seed("w", ba(["owner", "other"], true)); return doc(owner, "ba", "w"); };
await allowed("owner creates ba", setDoc(doc(owner, "ba", "w0"), ba(["owner"], true)));
await denied("owner adds someone else right after create", setDoc(doc(owner, "ba", "w0"), ba(["owner", "victim"], true)));
await denied("owner adds someone else while making it private", setDoc(await w1(), ba(["owner", "victim"], false)));
await denied("owner hands writers[0] to someone else", setDoc(await w1(), ba(["victim", "owner"], true)));
await denied("owner replaces writers", setDoc(await w1(), ba(["victim"], true)));
await denied("owner duplicates self in writers", setDoc(await w1(), ba(["owner", "owner"], true)));
await denied("owner removes a writer", setDoc(await w2(), ba(["owner"], true)));
await denied("owner empties writers", setDoc(await w2(), ba([], true)));
await denied("owner swaps a writer for self", setDoc(await w2(), ba(["owner", "owner"], true)));
await denied("non-member adds someone else instead of self", setDoc(doc(other, "ba", (await w1()).id), ba(["owner", "victim"], true)));
await denied("non-member swaps an existing writer for self", setDoc(doc(coeditor, "ba", (await w2()).id), ba(["owner", "coeditor"], true)));
await denied("joiner adds self twice",setDoc(doc(coeditor, "ba", (await w2()).id), ba(["owner", "other", "coeditor", "coeditor"], true)));
await allowed("non-owner joins", setDoc(doc(other, "ba", (await w1()).id), ba(["owner", "other"], true)));
await allowed("owner edits with writers unchanged", setDoc(await w2(), ba(["owner", "other"], true, { title: "o2" })));
await allowed("owner still makes it private", setDoc(await w2(), ba(["owner", "other"], false)));
await allowed("owner still deletes", deleteDoc(await w2()));

// legacy ba without writers (e.g. made by create_ba): editable, nobody owns it
await seed("legacy", ba([], true));
await denied("nobody can make an ownerless ba private", setDoc(doc(other, "ba", "legacy"), ba(["other"], false)));
await denied("first editor of an ownerless ba adds someone else", setDoc(doc(other, "ba", "legacy"), ba(["other", "victim"], true)));
// The first signed-in editor lands in writers[0] and owns it from then on.
await allowed("anyone signed in edits ownerless ba", setDoc(doc(other, "ba", "legacy"), ba(["other"], true)));
await allowed("the first editor now owns it and makes it private", setDoc(doc(other, "ba", "legacy"), ba(["other"], false)));

// delete
await allowed("owner deletes", deleteDoc(doc(owner, "ba", "sb")));

// other collections
await denied("unauth writes other collection", setDoc(doc(anon, "zzz", "a"), { x: 1 }));
await denied("signed-in writes other collection", setDoc(doc(other, "map", "a"), { x: 1 }));
await denied("unauth reads other collection", getDoc(doc(anon, "zzz", "a")));

await Promise.all(apps.map((app) => deleteApp(app)));
if (failures.length > 0) {
  console.log(`${failures.length} firestore rules check(s) failed:\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("all firestore rules checks passed");
process.exit(0);
