/// <reference types="cypress" />

import { ready_one_group } from "../../support/e2e";

describe("ready one group with one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_one_group();
  });

  it("do nothing", () => {});
});
