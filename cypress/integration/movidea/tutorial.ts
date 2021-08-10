/// <reference types="cypress" />
import firebase from "firebase/app";
import "firebase/auth";

describe("tutorial", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("main", () => {
    if (true) {
      cy.getGlobal((g) => g.dialog).should("eql", "Tutorial");
      cy.testid("tutorial-next").click();
      cy.getGlobal((g) => g.tutorial_page).should("eql", 1);
      cy.testid("tutorial-next").click();

      cy.testid("tutorial-close").click();
      cy.getGlobal((g) => g.dialog).should("eql", "");
      cy.testid("tutorial-status").click();
      cy.getGlobal((g) => g.dialog).should("eql", "Tutorial");

      cy.testid("tutorial-next").click();
      // Add Kozane
      cy.testid("tutorial-close").click();
      cy.testid("main-menu").click();
      cy.contains("Add Kozane").click();
      cy.testid("textarea").type("a\nb\nc");
      cy.setGlobal({ fix_timestamp_for_test: 0 });
      cy.testid("add-kozane-button").click();
      cy.setGlobal({ fix_timestamp_for_test: null });
      cy.testid("tutorial-status").click();

      cy.testid("tutorial-next").click();
      // drag in/out
      cy.testid("tutorial-close").click();
      cy.getGlobal((g) => {
        console.log(g.itemStore);
      });
      // drag out
      cy.testid("3").trigger("dragstart");
      cy.get("#canvas").trigger("drop", 135, 350);
      cy.testid("4").trigger("dragstart");
      cy.get("#canvas").trigger("drop", 135, 550);
      // drag in
      cy.testid("4").trigger("dragstart");
      cy.testid("1").trigger("drop", 0, 0);
      // drag inside
      cy.testid("2").trigger("dragstart");
      cy.testid("1").trigger("drop", 100, 200);
      cy.testid("tutorial-status").click();

      cy.testid("tutorial-next").click();
      // adjust font size

      cy.testid("tutorial-next").click();
      // // two finger gesture

      cy.testid("tutorial-next").click();
      // item menu
      cy.testid("tutorial-close").click();
      cy.testid("3").click();
      cy.testid("kozane-delete").click();
      cy.testid("1").click();
      cy.testid("group-delete").click();
      cy.testid("tutorial-status").click();

      cy.testid("tutorial-next").click();
      // select objects

      cy.testid("tutorial-next").click();
      cy.testid("tutorial-next").click();
      // enable autosave
      cy.testid("tutorial-close").click();
    }

    // Add Kozane
    cy.testid("tutorial-close").click();
    cy.testid("main-menu").click();
    cy.contains("Add Kozane").click();
    cy.testid("textarea").type("a\nb\nc");
    cy.setGlobal({ fix_timestamp_for_test: 0 });
    cy.testid("add-kozane-button").click();
    cy.setGlobal({ fix_timestamp_for_test: null });

    cy.testid("login-status").contains("not signed in");
    cy.movidea((m) => {
      m.toUseEmulator();
      m.auth.useEmulator("http://localhost:9099");
      m.auth.signInWithCredential(
        firebase.auth.GoogleAuthProvider.credential(
          null,
          '{"sub": "abc123", "email": "foo@example.com", "email_verified": true}'
        )
      );
    });

    cy.testid("login-status").contains("NISHIO_TEST");

    cy.setGlobal({ fix_ba_for_test: "test" });
    cy.testid("main-menu").click();
    cy.contains("Enable Cloud Auto-Save").click();
    cy.testid("save-status").contains("uploading");
    cy.testid("save-status").contains("done");
    cy.window()
      .then((w) => w.location.hash)
      .should("eql", "#edit=test");
  });
});
