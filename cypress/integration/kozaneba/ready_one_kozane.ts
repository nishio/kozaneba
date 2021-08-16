/// <reference types="cypress" />

import { ItemId } from "../../../src/Global/initializeGlobalState";

describe("ready one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    cy.movidea((m) => m.make_one_kozane({ id: "1" as ItemId, text: "1" }));
  });

  it("main", () => {
    cy.testid("1").trigger("mousedown");
    cy.testid("ba").trigger("mousemove", 200, 200);
    cy.testid("ba").trigger("mouseup", 100, 100);
  });
});
