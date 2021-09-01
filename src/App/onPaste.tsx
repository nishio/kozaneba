import React from "react";
import { add_scrapbox_item } from "../API/make_scrapbox_kozane";
import { updateGlobal } from "../Global/updateGlobal";
import { add_gyazo_item } from "./add_gyazo_item";
import { is_some_dialog_open } from "./is_some_dialog_open";
import { try_to_import_json } from "./try_to_import_json";

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
  } else if (try_to_import_json(text)) {
    // if true(=success) do nothing
  } else {
    updateGlobal((g) => {
      g.dialog = "AddKozane";
      g.add_kozane_text = text;
    });
  }
};
