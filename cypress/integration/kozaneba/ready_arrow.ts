/// <reference types="cypress" />

import { ItemId } from "../../../src/Global/initializeGlobalState";

describe("ready two kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    cy.movidea((m) => m.make_one_kozane({ id: "1" as ItemId, text: "1" }));
    cy.movidea((m) => m.make_one_kozane({ id: "2" as ItemId, text: "2" }));
    cy.updateGlobal((g) => {
      g.annotations.push({
        type: "line",
        items: ["1" as ItemId, "2" as ItemId],
        heads: ["none", "arrow"],
      });
    });
  });

  it("do nothing", () => {});
});
