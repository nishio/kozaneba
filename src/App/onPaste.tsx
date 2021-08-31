import React from "react";
import { add_item } from "../API/add_item";
import { add_scrapbox_item } from "../API/make_scrapbox_kozane";
import { get_center_of_screen } from "../Dialog/AddKozaneDialog/get_center_of_screen";
import { TGyazoItem } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { create_new_itemid } from "../Kozane/create_new_itemid";
import { is_some_dialog_open } from "./is_some_dialog_open";

export const onPaste = (e: React.ClipboardEvent) => {
  if (is_some_dialog_open()) return;
  if (navigator.clipboard.readText === undefined) {
    const text = prompt(
      "Paste URL again\nor if it is multiline text, press Enter to open AddKozane dialog "
    );
    if (text !== null) {
      pasted(text);
    }
    return;
  }
  navigator.clipboard.readText().then(pasted);
};

const pasted = (text: string) => {
  if (text.startsWith("https://scrapbox.io/")) {
    add_scrapbox_item(text);
  } else if (text.startsWith("https://gyazo.com/")) {
    add_gyazo_item(text);
  } else {
    updateGlobal((g) => {
      g.dialog = "AddKozane";
      g.add_kozane_text = text;
    });
  }
};

const add_gyazo_item = (url: string) => {
  const gyazo: TGyazoItem = {
    id: create_new_itemid(),
    type: "gyazo",
    text: `[${url}]`,
    url: url,

    position: get_center_of_screen(),
    scale: 1,
  };
  add_item(gyazo);
};
