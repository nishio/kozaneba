/// <reference types="cypress" />

import { ready_one_kozane } from "../../support/e2e";

describe("zoom", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
  });

  it("zoom center", () => {
    ready_one_kozane();
    cy.testid("ba").trigger("mousemove");
    cy.testid("ba").trigger("wheel", { ctrlKey: true, deltaY: 100 });
    cy.testid("ba").trigger("wheel", { ctrlKey: true, deltaY: -100 });

    cy.testid("ba").trigger("mousemove", 100, 100);
    cy.testid("ba").trigger("wheel", { ctrlKey: true, deltaY: 100 });
    cy.testid("1").should(
      "hasPosition",
      [130.90187072753906, 136.42005920410156]
    );
  });
});
