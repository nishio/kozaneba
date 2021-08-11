/// <reference types="cypress" />
import firebase from "firebase/app";
import "firebase/auth";

describe("tutorial", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.viewport(1000, 660);
  });

  it("main", () => {
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

    // adjust
    cy.testid("tutorial-open-prefilled-dialog").click();
    cy.setGlobal({ fix_timestamp_for_test: 0 });
    cy.testid("add-kozane-button").click();
    cy.setGlobal({ fix_timestamp_for_test: null });
    cy.getGlobal((g) => g.drawOrder.length).should("eql", 1);

    cy.testid("tutorial-status").click();
    cy.testid("tutorial-next").click();

    // ungroup
    cy.testid("tutorial-close").click();
    cy.setGlobal({ scale: 0.25 });
    cy.testid("5").click();
    cy.contains("ungroup").click();
    const num_kozane = 51;
    cy.getGlobal((g) => g.drawOrder.length).should("eql", num_kozane);

    cy.testid("tutorial-status").click();
    cy.testid("tutorial-next").click();
    // select objects
    cy.testid("tutorial-close").click();

    cy.viewport(600, 400);
    cy.get("#canvas").trigger("mousedown", 100, 150);
    cy.get("#canvas").trigger("mouseup", 250, 250);
    const num_selected = 12;
    cy.getGlobal((g) => g.selected_items.length).should("eql", num_selected);
    cy.testid("selection-view").click();
    cy.contains("make group").click();
    cy.getGlobal((g) => g.drawOrder.length).should(
      "eql",
      num_kozane - num_selected + 1
    );

    cy.testid("tutorial-status").click();
    cy.testid("tutorial-next").click();
    // it's not saved
    cy.testid("tutorial-next").click();
    cy.testid("tutorial-close").click();

    cy.testid("login-status").contains("not signed in");
    cy.testid("main-menu").click();
    cy.contains("Enable Cloud Auto-Save").click();
    cy.getGlobal((g) => g.dialog).should("eql", "CloudSave");
    cy.testid("cloud-save-dialog-not-save").click(); // close this time. We can not use Google SignIn

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

    cy.testid("tutorial-status").click();
    cy.testid("tutorial-next").click();
    // saved?
    cy.testid("tutorial-next").click();
    cy.contains("Tutorial Finished🎉").should("be.visible");
  });
});
