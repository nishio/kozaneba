/// <reference types="cypress" />

import "firebase/compat/auth";

describe("save", () => {
  it("enables cloud save with anonymous sign-in on the Firebase emulator", () => {
    cy.visit("/#blank");
    cy.viewport(500, 500);

    cy.movidea((m) => {
      m.toUseEmulator();
    });

    cy.testid("main-menu").click();
    cy.contains("Add Kozane").click();
    cy.testid("textarea").type("a\nb\nc");
    cy.testid("add-kozane-button").click();

    cy.testid("dev-menu").click();
    cy.contains("Trigger Cloud Save").click();
    cy.testid("continue-as-anonymous-user").click();
    cy.testid("login-status").contains("signed in as anonymous user");

    cy.movidea((m) => {
      m.auth.signOut();
    });
    cy.testid("login-status").contains("not signed in");
  });
});
