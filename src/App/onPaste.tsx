import React from "react";
import { add_kozane } from "../API/add_kozane";
import { updateGlobal } from "../Global/updateGlobal";
import { add_scrapbox_item } from "../Scrapbox/add_scrapbox_item";
import { add_image_files, image_files_from } from "../Image/add_image_files";
import { is_image_url } from "../Image/is_image_url";
import { add_gyazo_item } from "../utils/add_gyazo_item";
import { is_some_dialog_open } from "../utils/is_some_dialog_open";
import { try_to_import_json } from "../utils/JSON/try_to_import_json";
import { url_to_text } from "../utils/url_to_text";

export const onPaste = (e: React.ClipboardEvent) => {
  if (is_some_dialog_open()) return;
  const files = image_files_from(e.clipboardData);
  if (files.length > 0) {
    e.preventDefault();
    add_image_files(files);
    return;
  }
  if (navigator.clipboard.readText === undefined) {
    const text = prompt(
      "Paste URL again\nor if it is multiline text, press Enter to open AddKozane dialog ",
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
  } else if (is_image_url(text)) {
    add_gyazo_item(text);
  } else if (text.startsWith("https://") || text.startsWith("http://")) {
    add_kozane(url_to_text(text), { custom: { url: text } });
  } else if (try_to_import_json(text)) {
    // if true(=success) do nothing
  } else {
    updateGlobal((g) => {
      g.dialog = "AddKozane";
      g.add_kozane_text = text;
      // related code in create_squared_group.tsx
    });
  }
};
