/// <reference types="cypress" />

import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import { ItemId } from "../../../src/Global/initializeGlobalState";

describe("ready one group with one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    cy.movidea((m) => {
      m.make_one_kozane({
        id: "1" as ItemId,
        text: "1",
        position: [-100, 0] as TWorldCoord,
      });
      m.make_items_into_new_group(["1"], { id: "G1", text: "G1" });
      m.make_one_kozane({
        id: "2" as ItemId,
        text: "2",
        position: [100, 0] as TWorldCoord,
      });
      m.make_items_into_new_group(["2"], { id: "G2", text: "G2" });
    });
  });

  it("main", () => {});
});
