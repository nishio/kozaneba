import firebase from "firebase/app";
import "firebase/auth";
import { DocDataV3 } from "../../../src/Cloud/FirestoreIO";
describe("Some Test", () => {
  // it("Adds document to test_hello_world collection of Firestore", () => {
  //   cy.callFirestore("add", "test_hello_world", { some: "value" });
  // });
  it("login", () => {
    cy.visit("/#blank");
    cy.viewport(500, 500);

    // cy.login();
    cy.movidea((m) => {
      m.auth.useEmulator("http://localhost:9099");
      m.auth.signInWithCredential(
        firebase.auth.GoogleAuthProvider.credential(
          null,
          '{"sub": "abc123", "email": "foo@example.com", "email_verified": true}'
        )
      );
      // @ts-ignore
      window.auth = m.auth;
    });

    cy.contains("NISHIO_TEST");
  });

  it("save", () => {
    cy.movidea((m) => {
      m.db.settings({ experimentalForceLongPolling: true });
      m.db.useEmulator("localhost", 8080);
      m.tmpfunc();
    });
  });
});
