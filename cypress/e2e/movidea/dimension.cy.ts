/// <reference types="cypress" />

import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import { TMovidea } from "../../../src/Global/exposeGlobal";
import {
  KOZANE_BORDER,
  KOZANE_HEIGHT,
  KOZANE_WIDTH,
} from "../../../src/utils/kozane_constants";

let movidea: TMovidea;
describe("dimension", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    const json = {
      drawOrder: [1],
      itemStore: {
        1: {
          type: "group",
          id: 1,
          position: [0, 0],
          nameplate: null,
          isOpen: true,
          items: [2, 3],
          text: "",
          scale: 1,
        },
        2: {
          type: "kozane",
          id: 2,
          position: [-100, 0],
          text: "A",
          compact: true,
          scale: 1,
        },
        3: {
          type: "kozane",
          id: 3,
          position: [100, 0],
          text: "B",
          compact: true,
          scale: 1,
        },
      },
    };

    cy.movidea((m) => {
      movidea = m;
      movidea.setGlobal({
        drawOrder: json.drawOrder,
        itemStore: json.itemStore,
      });
    });
  });

  it("main", () => {
    let cw = 500;
    let ch = 500;
    cy.viewport(cw, ch);

    cy.get("body").then((body) => {
      expect(body[0].clientWidth).to.equal(cw);
      expect(body[0].clientHeight).to.equal(ch);
    });

    const topLeft = ([x, y]: number[]) => [
      x - KOZANE_WIDTH / 2 - KOZANE_BORDER,
      y - KOZANE_HEIGHT / 2 - KOZANE_BORDER,
    ];

    {
      const [x, y] = [0, 0];
      cy.updateGlobal((g) => {
        g.itemStore["2"].position = [x, y] as TWorldCoord;
      });
      const [top, left] = topLeft([x, y]);
      cy.testid("2").then((el) => {
        return cy
          .wrap(el)
          .should(
            "hasPosition",
            movidea.world_to_screen([top, left] as TWorldCoord)
          );
      });
    }
    {
      const [x, y] = [-123, 45];
      cy.updateGlobal((g) => {
        g.itemStore["2"].position = [x, y] as TWorldCoord;
      });
      const [top, left] = topLeft([x, y]);
      cy.testid("2").then((el) => {
        return cy
          .wrap(el)
          .should(
            "hasPosition",
            movidea.world_to_screen([top, left] as TWorldCoord)
          );
      });
    }

    {
      const [x, y] = [-13, 48];
      cy.updateGlobal((g) => {
        g.trans_x = 67;
        g.trans_y = 89;
        g.itemStore["2"].position = [x, y] as TWorldCoord;
      });
      const [top, left] = topLeft([x, y]);
      cy.testid("2").then((el) => {
        return cy
          .wrap(el)
          .should(
            "hasPosition",
            movidea.world_to_screen([top, left] as TWorldCoord)
          );
      });
    }

    {
      const [x, y] = [10, 20];
      cy.updateGlobal((g) => {
        g.trans_x = 67;
        g.trans_y = 89;
        g.scale = 2;
        g.itemStore["2"].position = [x, y] as TWorldCoord;
      });
      const [top, left] = topLeft([x, y]);
      cy.testid("2").then((el) => {
        return cy
          .wrap(el)
          .should(
            "hasPosition",
            movidea.world_to_screen([top, left] as TWorldCoord)
          );
      });
    }
  });
});
