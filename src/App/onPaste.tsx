import React from "react";
import { add_kozane } from "../API/add_kozane";
import { add_scrapbox_item } from "../Scrapbox/add_scrapbox_item";
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

const url_to_text = (url: string) => {
  const u = new URL(url);
  const items = u.pathname.split("/");
  const last = items[items.length - 1] ?? items[items.length - 2];
  if (last === undefined) {
    return u.hostname;
  }
  return decodeURIComponent(last);
};

const pasted = (text: string) => {
  if (text.startsWith("https://scrapbox.io/")) {
    add_scrapbox_item(text);
  } else if (text.startsWith("https://gyazo.com/")) {
    add_gyazo_item(text);
  } else if (text.startsWith("https://") || text.startsWith("http://")) {
    add_kozane(url_to_text(text), { custom: { url: text } });
  } else if (try_to_import_json(text)) {
    // if true(=success) do nothing
  } else {
    updateGlobal((g) => {
      g.dialog = "AddKozane";
      g.add_kozane_text = text;
    });
  }
};
