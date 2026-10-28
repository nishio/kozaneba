/// <reference types="cypress" />
// D2: a Ba that is not saved to the cloud is kept in localStorage and offered
// for restore on the top page. The top page opens the (modal) tutorial, so the
// offer must be clickable above it; Cypress checks that the button is not
// covered before clicking.

const DRAFT_KEY = "kozaneba_local_draft";

const draft = () => ({
  saved_at: Date.now(),
  doc: {
    version: 3,
    itemStore: {
      k1: { type: "kozane", id: "k1", text: "restored idea", position: [0, 0], scale: 1 },
    },
    drawOrder: ["k1"],
    last_updated: 1700000000000,
    anyone_writable: true,
    title: "",
    writers: [],
    annotations: [],
    scrapbox: "",
  },
});

describe("local draft", () => {
  it("offers to restore a local Ba on the top page, above the tutorial", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft()));
      },
    });
    cy.testid("tutorial-title").should("be.visible");
    cy.contains("button", /^(Restore|復元する)$/).click();
    cy.getGlobal((g) => g.dialog).should("eql", "");
    cy.getGlobal((g) => g.drawOrder).should("eql", ["k1"]);
    cy.contains("restored idea").should("be.visible");
  });

  it("keeps a local Ba across a reload", () => {
    cy.visit("/");
    cy.testid("tutorial-close").click();
    // state preparation (not the behavior under test): a local Ba with a kozane
    cy.setGlobal({
      itemStore: {
        k2: { type: "kozane", id: "k2", text: "unsaved idea", position: [0, 0], scale: 1 },
      } as never,
      drawOrder: ["k2"],
    });
    cy.contains("unsaved idea").should("be.visible");
    cy.reload();
    cy.getGlobal((g) => g.drawOrder).should("eql", []);
    cy.contains("button", /^(Restore|復元する)$/).click();
    cy.getGlobal((g) => g.drawOrder).should("eql", ["k2"]);
    cy.contains("unsaved idea").should("be.visible");
  });
});
