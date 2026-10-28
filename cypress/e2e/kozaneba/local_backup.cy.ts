/// <reference types="cypress" />
// D1 / D8: local backups (real IndexedDB through Dexie) and the restore list
// in the Ba dialog. Needs the Firebase emulator (auth 9099, firestore 8080).
// The restored contents must reach Firestore through the normal save; this
// spec reads the emulator's REST API to check it.

const PROJECT = "regroup-d4932";
const doc_url = (ba: string) =>
  `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents/ba/${ba}`;

// a database as written by the previous version (Dexie version 2 = IDB 20),
// with one backup taken while to_make_local_backup was on
const make_legacy_db = (win: Window) =>
  new Promise<void>((resolve, reject) => {
    const del = win.indexedDB.deleteDatabase("Kozaneba");
    del.onsuccess = () => {
      const req = win.indexedDB.open("Kozaneba", 20);
      req.onupgradeneeded = () => {
        const store = req.result.createObjectStore("backup", { keyPath: "id", autoIncrement: true });
        store.createIndex("cloud_ba", "cloud_ba");
        store.createIndex("last_updated", "last_updated");
      };
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("backup", "readwrite");
        tx.objectStore("backup").add({
          cloud_ba: "legacyBa",
          last_updated: 1600000000000,
          json: JSON.stringify({ itemStore: { x: {}, y: {} }, drawOrder: ["x", "y"] }),
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
      };
      req.onerror = () => reject(req.error);
    };
    del.onerror = () => reject(del.error);
  });

const read_store = (win: Window, name: string) =>
  new Promise<unknown[]>((resolve, reject) => {
    const req = win.indexedDB.open("Kozaneba");
    req.onsuccess = () => {
      const db = req.result;
      const r = db.transaction(name).objectStore(name).getAll();
      r.onsuccess = () => {
        db.close();
        resolve(r.result);
      };
      r.onerror = () => reject(r.error);
    };
  });

const add_kozane = (text: string) => {
  cy.testid("main-menu").click();
  cy.contains("Add Kozane").click();
  cy.testid("textarea").type(text);
  cy.testid("add-kozane-button").click();
};

// .its / .invoke are retried until the assertion holds (cy.getGlobal is not)
const global = () => cy.window().its("movidea").invoke("getGlobal");
const expect_items = (n: number) =>
  global().its("itemStore").should((x) => expect(Object.keys(x as object)).to.have.length(n));
const wait_saved = () => global().its("statusBar.type").should("eql", "done");

describe("local backup", () => {
  it("keeps each save on this device and loads an older one back through the normal save", () => {
    cy.visit("/#blank");
    cy.window().then((win) => make_legacy_db(win));
    cy.reload();
    cy.viewport(1000, 660);
    cy.movidea((m) => {
      m.toUseEmulator();
    });
    cy.updateGlobal((g) => {
      g.language = "en";
    });

    add_kozane("a");
    cy.testid("dev-menu").click();
    cy.contains("Trigger Cloud Save").click();
    cy.testid("continue-as-anonymous-user").click();
    // The hash changes when the server acknowledges the first write. The
    // first write to a fresh emulator takes several seconds (measured 5.9 s
    // and 6.8 s locally, over the 4 s default; the next one ~0.5 s).
    cy.location("hash", { timeout: 30000 }).should("match", /^#edit=/);
    cy.testid("save-status").should("exist");

    wait_saved();
    add_kozane("b"); // saved: 4 items (each add makes a kozane and a group)
    wait_saved();
    add_kozane("c"); // saved: 6 items
    wait_saved();
    expect_items(6);

    cy.location("hash").then((hash) => {
      const ba = hash.replace("#edit=", "");
      // wait until the 6-item version is on the server
      const server_items = () =>
        cy
          .request({ url: doc_url(ba), headers: { Authorization: "Bearer owner" } })
          .its("body.fields.itemStore.mapValue.fields")
          .then((f) => Object.keys(f ?? {}).length);
      server_items().should("eql", 6);

      cy.testid("main-menu").click();
      cy.contains("li", /^Ba$/).click();
      cy.testid("backup-list").contains("Restore from backups").click();
      cy.testid("backup-list").find("li").should("have.length.at.least", 2);
      cy.testid("backup-list").find("li").first().should("contain", "(6 items");
      cy.testid("backup-list")
        .contains("li", "(4 items")
        .within(() => {
          cy.contains("button", "Load").click();
        });
      cy.testid("backup-restored").should("exist");
      expect_items(4);

      // reached Firestore through the normal save
      cy.wait(1000);
      cy.request({ url: doc_url(ba), headers: { Authorization: "Bearer owner" } }).then((r) => {
        const fields = r.body.fields;
        expect(Object.keys(fields.itemStore.mapValue.fields)).to.have.length(4);
        expect(fields.writers.arrayValue.values).to.have.length(1);
      });
      // the 6-item contents before the load are in the list too (reopen)
      cy.get("body").type("{esc}");
      cy.testid("ba-dialog").should("not.exist");
      cy.testid("main-menu").click();
      cy.contains("li", /^Ba$/).click();
      cy.testid("backup-list").contains("Restore from backups").click();
      cy.testid("backup-list").find("li").first().should("contain", "(4 items");
      cy.testid("backup-list").find("li").eq(1).should("contain", "(6 items");
    });

    // the backup of the previous version got its metadata in the upgrade
    cy.window().then((win) =>
      read_store(win, "backup_meta").then((metas) => {
        const legacy = (metas as { cloud_ba: string; n_items: number; saved_at: number }[]).filter(
          (m) => m.cloud_ba === "legacyBa"
        );
        expect(legacy).to.have.length(1);
        expect(legacy[0]!.n_items).to.eql(2);
        expect(legacy[0]!.saved_at).to.eql(1600000000000);
      })
    );
  });
});
