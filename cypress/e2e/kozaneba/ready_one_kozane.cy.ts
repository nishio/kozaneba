/// <reference types="cypress" />

import { ready_one_kozane } from "../../support/e2e";

describe("ready one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_one_kozane();
  });

  it("do nothing", () => {});
});
