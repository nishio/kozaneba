/// <reference types="cypress" />

import { ready_one_kozane } from "../../support";

describe("ready one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_one_kozane();
  });

  it("do nothing", () => {});
});
