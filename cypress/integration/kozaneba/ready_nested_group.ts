/// <reference types="cypress" />

import { ready_nested_group } from "../../support";

describe("ready nested groups", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_nested_group();
  });
  it("do nothing", () => {});
});
