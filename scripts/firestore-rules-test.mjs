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

const allowed = async (name, p) => {
  try {
    await p;
  } catch (e) {
    assert.fail(`${name}: expected allowed, got ${e.code ?? e}`);
  }
  console.log(`ok   allowed: ${name}`);
};
const denied = async (name, p) => {
  try {
    await p;
  } catch (e) {
    assert.equal(e.code, "permission-denied", `${name}: ${e}`);
    console.log(`ok   denied:  ${name}`);
    return;
  }
  assert.fail(`${name}: expected permission-denied`);
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

// legacy ba without writers (e.g. made by create_ba): editable, nobody owns it
const admin = client("owner");
await allowed("seed legacy ba", setDoc(doc(admin, "ba", "legacy"), ba(["owner"], true)));
await allowed("owner empties writers", setDoc(doc(admin, "ba", "legacy"), ba([], true)));
await denied("nobody can make an ownerless ba private", setDoc(doc(other, "ba", "legacy"), ba(["other"], false)));
// The first signed-in editor lands in writers[0] and owns it from then on.
await allowed("anyone signed in edits ownerless ba", setDoc(doc(other, "ba", "legacy"), ba(["other"], true)));

// delete
await allowed("owner deletes", deleteDoc(doc(owner, "ba", "sb")));

// other collections
await denied("unauth writes other collection", setDoc(doc(anon, "zzz", "a"), { x: 1 }));
await denied("signed-in writes other collection", setDoc(doc(other, "map", "a"), { x: 1 }));
await denied("unauth reads other collection", getDoc(doc(anon, "zzz", "a")));

await Promise.all(apps.map((app) => deleteApp(app)));
console.log("all firestore rules checks passed");
process.exit(0);
