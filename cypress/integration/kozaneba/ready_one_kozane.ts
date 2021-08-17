/// <reference types="cypress" />

import { ItemId } from "../../../src/Global/initializeGlobalState";

export const ready_one_kozane = () => {
  cy.movidea((m) => m.make_one_kozane({ id: "1" as ItemId, text: "1" }));
};

describe("ready one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
  });

  it("do nothing", () => {});
});
