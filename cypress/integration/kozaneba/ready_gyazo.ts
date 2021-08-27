/// <reference types="cypress" />

import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import {
  ItemId,
  TGyazoItem,
  TScrapboxItem,
} from "../../../src/Global/initializeGlobalState";
import { add_item } from "../../support";

describe("ready one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    const gyazo: TGyazoItem = {
      id: "gyazo" as ItemId,
      type: "gyazo",
      url: "https://gyazo.com/3ff617ca88ff2971f955498c4a490022",
      text: "" as "",
      position: [0, 0] as TWorldCoord,
      scale: 1,
    };
    add_item(gyazo);
  });

  it("do nothing", () => {});
});
