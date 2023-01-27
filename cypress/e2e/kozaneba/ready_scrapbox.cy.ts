/// <reference types="cypress" />

import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import { TItemId } from "../../../src/Global/TItemId";
import { TScrapboxItem } from "../../../src/Global/TScrapboxItem";
import { add_item } from "../../support/e2e";

describe("ready one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");

    const scrapbox1: TScrapboxItem = {
      id: "scrapbox1" as TItemId,
      type: "scrapbox",
      text: "2021-08-27Kozaneba開発日記",
      image: "https://gyazo.com/872f3897132974239c3ad539a6a8df69/thumb/400",
      position: [0, 0] as TWorldCoord,
      scale: 1,
      url: "https://scrapbox.io/nishio/2021-08-27Kozaneba%E9%96%8B%E7%99%BA%E6%97%A5%E8%A8%98",
      description: [],
    };
    add_item(scrapbox1);

    const scrapbox2: TScrapboxItem = {
      id: "scrapbox2" as TItemId,
      type: "scrapbox",
      text: "Wikiは辞書ではない",
      image: "",
      url: "",
      description: [
        "[Wiki]を[辞書]のメタファーで捉えることは有害",
        "それは「本文はタイトルの単語の説明」という制限を増やしてしまう",
        "辞書の見出し語は、実際の出現頻度以上に名詞形が多い",
      ],

      position: [400, 0] as TWorldCoord,
      scale: 1,
    };
    add_item(scrapbox2);
  });

  it("do nothing", () => {});
});
