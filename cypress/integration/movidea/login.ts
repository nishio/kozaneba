import firebase from "firebase/app";
import "firebase/auth";

describe("login", () => {
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
    });

    cy.contains("NISHIO_TEST");
  });
});
