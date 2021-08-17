/// <reference types="cypress" />

import { ItemId } from "../../../src/Global/initializeGlobalState";

export const ready_one_group = () => {
  cy.movidea((m) => {
    m.make_one_kozane({ id: "1" as ItemId, text: "1" });
    m.make_items_into_new_group(["1"]);
  });
};

describe("ready one group with one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_one_group();
  });

  it("do nothing", () => {});
});
