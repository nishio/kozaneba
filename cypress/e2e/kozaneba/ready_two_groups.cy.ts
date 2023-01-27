/// <reference types="cypress" />

import { ready_two_groups } from "../../support/e2e";

describe("ready two groups", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_two_groups();
  });
  it("do nothing", () => {});
});
