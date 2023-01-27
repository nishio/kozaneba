/// <reference types="cypress" />
import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import { TItemId } from "../../../src/Global/TItemId";
import { ready_one_group } from "../../support/e2e";

describe("ready one group with one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_one_group();
  });

  it("arrow1", () => {
    cy.movidea((m) =>
      m.make_one_kozane({
        id: "A" as TItemId,
        text: "A",
        position: [-200, 0] as TWorldCoord,
      })
    );
    cy.updateGlobal((g) => {
      g.annotations.push({
        type: "line",
        items: ["G1", "A"] as TItemId[],
        heads: ["arrow", "arrow"],
        custom: {},
        is_doubled: false,
      });
    });
  });

  it("arrow2", () => {
    cy.movidea((m) =>
      m.make_one_kozane({
        id: "A" as TItemId,
        text: "A",
        position: [0, 200] as TWorldCoord,
      })
    );
    cy.updateGlobal((g) => {
      g.annotations.push({
        type: "line",
        items: ["G1", "A"] as TItemId[],
        heads: ["arrow", "arrow"],
        custom: {},
        is_doubled: false,
      });
    });
  });
});
