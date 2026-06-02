import firebase from "firebase/compat/app";
import "firebase/compat/auth";

describe("login", () => {
  it("login", () => {
    cy.visit("/#blank");
    cy.viewport(500, 500);

    // cy.login();
    cy.movidea((m) => {
      m.toUseEmulator();
      m.auth.signInWithCredential(
        firebase.auth.GoogleAuthProvider.credential(
          null,
          '{"sub": "abc123", "email": "foo@example.com", "email_verified": true}'
        )
      );
    });

    cy.testid("login-status").contains("user with no display name");

    cy.testid("dev-menu").click();
    cy.contains("Sign Out").click();

    cy.testid("login-status").contains("not signed in");
  });
});
