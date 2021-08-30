/// <reference types="cypress" />

import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import {
  ItemId,
  TGyazoItem,
  TScrapboxItem,
} from "../../../src/Global/initializeGlobalState";
import { KozaneItem, TKozaneItem } from "../../../src/Kozane/KozaneItem";
import { add_item } from "../../support";

describe("ready one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");

    const scrapbox1: TScrapboxItem = {
      id: "scrapbox1" as ItemId,
      type: "scrapbox",
      text: "常滑市が音楽フェス主催者側へ抗議文送付へ 感染対策不徹底で｜NHK 東海のニュース",
      image: "https://www3.nhk.or.jp/news/img/fb_futa_600px.png",
      position: [0, 0] as TWorldCoord,
      scale: 1,
      url: "",
      description: [],
    };
    add_item(scrapbox1);

    const scrapbox3: TScrapboxItem = {
      id: "scrapbox3" as ItemId,
      type: "scrapbox",
      text: "2021-08-27Kozaneba開発日記",
      image: "https://gyazo.com/872f3897132974239c3ad539a6a8df69/thumb/400",
      position: [800, 0] as TWorldCoord,
      scale: 1,
      url: "",
      description: [],
    };
    add_item(scrapbox3);

    const scrapbox2: TScrapboxItem = {
      id: "scrapbox2" as ItemId,
      type: "scrapbox",
      text: "Develop. Preview. Ship. For the best frontend teams – Vercel",
      image: "",
      url: "",
      description: [
        "Deploy web projects with the best frontend developer experience and highest end-user performance.",
      ],

      position: [400, 0] as TWorldCoord,
      scale: 1,
    };
    add_item(scrapbox2);
    const scrapbox4: TScrapboxItem = {
      id: "scrapbox4" as ItemId,
      type: "scrapbox",
      text: "Model–view–viewmodel - Wikipedia",
      image: "https://en.wikipedia.org//static/favicon/wikipedia.ico",
      position: [1200, 0] as TWorldCoord,
      scale: 1,
      url: "",
      description: [],
    };
    add_item(scrapbox4);

    const kozane: TKozaneItem = new KozaneItem();
    kozane.text = "hello";
    kozane.custom = { is_link: true };
    add_item(kozane);
  });

  it("do nothing", () => {});
});
