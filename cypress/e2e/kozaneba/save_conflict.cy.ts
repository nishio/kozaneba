/// <reference types="cypress" />
// D3: a tab whose listener is asleep must not overwrite what another device
// saved in the meantime. Real Firestore SDK against the emulator (auth 9099,
// firestore 8080). "Another device" is a second Firebase app in the test,
// signed in as another anonymous user (the Ba is shared as editable, as
// initial_save makes it). The server is read through the emulator REST API.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const PROJECT = "regroup-d4932";
const read_doc = (ba: string) =>
  cy
    .request({
      url: `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents/ba/${ba}`,
      headers: { Authorization: "Bearer owner" },
    })
    .its("body.fields");
const texts = (fields: any): string[] =>
  Object.values(fields.itemStore.mapValue.fields ?? {})
    .map((x: any) => x.mapValue.fields.text?.stringValue)
    .filter((x) => x !== undefined)
    .sort();

const other_device = () => {
  const app = firebase.initializeApp(
    { apiKey: "x", authDomain: "regroup-d4932.firebaseapp.com", projectId: PROJECT },
    "ipad-" + Date.now()
  );
  app.firestore().useEmulator("127.0.0.1", 8080);
  app.auth().useEmulator("http://127.0.0.1:9099");
  return app;
};

const add_kozane = (text: string) => {
  cy.testid("main-menu").click();
  cy.contains("Add Kozane").click();
  cy.testid("textarea").type(text);
  cy.testid("add-kozane-button").click();
};
const global = () => cy.window().its("movidea").invoke("getGlobal");

describe("save conflict", () => {
  it("a sleeping tab does not overwrite another device's save, and can save its own as a new Ba", () => {
    cy.visit("/#blank");
    cy.viewport(1000, 660);
    cy.movidea((m) => {
      m.toUseEmulator();
      // the auth emulator session of an earlier test may still be there
      m.auth.signOut();
    });
    cy.testid("login-status").contains("not signed in");
    cy.updateGlobal((g) => {
      g.language = "en";
    });
    add_kozane("from the laptop");
    cy.testid("dev-menu").click();
    cy.contains("Trigger Cloud Save").click();
    cy.testid("continue-as-anonymous-user").click();
    cy.location("hash").should("match", /^#edit=/);
    global().its("statusBar.type").should("eql", "done");

    cy.location("hash").then((hash) => {
      const ba = hash.replace("#edit=", "");
      // the laptop sleeps: its listener stops
      cy.movidea((m) => m.db.disableNetwork());

      // the iPad opens the same Ba and saves an hour of work
      const ipad = other_device();
      cy.wrap(null).then(async () => {
        await ipad.auth().signInAnonymously();
        const ref = ipad.firestore().collection("ba").doc(ba);
        const doc = (await ref.get()).data()!;
        doc.itemStore["ipad1"] = { type: "kozane", id: "ipad1", text: "an hour on the iPad", position: [300, 0], scale: 1 };
        doc.drawOrder = [...doc.drawOrder, "ipad1"];
        doc.writers = [...doc.writers, ipad.auth().currentUser!.uid];
        doc.last_updated = Date.now();
        await ref.set(doc);
      });
      read_doc(ba).then((f) => {
        expect(texts(f)).to.include("an hour on the iPad");
      });

      // the laptop wakes up and edits before its listener has caught up
      add_kozane("laptop after waking up");
      cy.movidea((m) => m.db.enableNetwork());

      cy.testid("save-conflict").should("contain", "updated on another device or tab");
      // the iPad's work is still on the server, the laptop's edit is not
      read_doc(ba).then((f) => {
        expect(texts(f)).to.include("an hour on the iPad");
        expect(texts(f)).not.to.include("laptop after waking up");
      });
      // the laptop still shows its own state
      global()
        .its("itemStore")
        .should((s: any) => {
          const t = Object.values(s).map((x: any) => x.text);
          expect(t).to.include("laptop after waking up");
          expect(t).not.to.include("an hour on the iPad");
        });

      cy.testid("save-conflict").contains("button", "Save this as a new Ba").click();
      cy.location("hash").should("match", /^#edit=/).and("not.eq", hash);
      cy.location("hash").then((hash2) => {
        const copy = hash2.replace("#edit=", "");
        read_doc(copy).then((f) => {
          expect(texts(f)).to.include("laptop after waking up");
          expect(texts(f)).not.to.include("an hour on the iPad");
        });
        read_doc(ba).then((f) => {
          expect(texts(f)).to.include("an hour on the iPad");
        });
      });
      cy.testid("save-conflict").should("not.exist");
      cy.wrap(null).then(() => ipad.delete());
    });
  });

  it("normal editing in one tab saves every edit without a false conflict", () => {
    cy.visit("/#blank");
    cy.viewport(1000, 660);
    cy.movidea((m) => {
      m.toUseEmulator();
      // the auth emulator session of an earlier test may still be there
      m.auth.signOut();
    });
    cy.testid("login-status").contains("not signed in");
    cy.updateGlobal((g) => {
      g.language = "en";
    });
    add_kozane("one");
    cy.testid("dev-menu").click();
    cy.contains("Trigger Cloud Save").click();
    cy.testid("continue-as-anonymous-user").click();
    cy.location("hash").should("match", /^#edit=/);
    add_kozane("two");
    add_kozane("three");
    add_kozane("four");
    global().its("statusBar.type").should("eql", "done");
    cy.testid("save-conflict").should("not.exist");
    cy.location("hash").then((hash) => {
      read_doc(hash.replace("#edit=", "")).then((f) => {
        expect(texts(f)).to.include.members(["one", "two", "three", "four"]);
      });
    });
  });
});
