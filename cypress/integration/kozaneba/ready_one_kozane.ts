/// <reference types="cypress" />

import { ready_one_kozane } from "../../support";

describe("ready one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_one_kozane();
  });

  it("selection", () => {
    cy.testid("ba").trigger("mousedown", 100, 100);
    cy.testid("ba").trigger("mousemove", 300, 300);
    cy.testid("ba").trigger("mouseup", 400, 400);
  });
  it("do nothing", () => {});
});
