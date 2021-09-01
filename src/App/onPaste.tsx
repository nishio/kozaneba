import React from "react";
import { add_item } from "../API/add_item";
import { add_scrapbox_item } from "../API/make_scrapbox_kozane";
import { redraw } from "../API/redraw";
import { get_center_of_screen } from "../Dialog/AddKozaneDialog/get_center_of_screen";
import { get_item } from "../Event/get_item";
import { ItemId, TGyazoItem, TItem } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { create_new_itemid } from "../Kozane/create_new_itemid";
import { normalize_group_position } from "../Menu/normalize_group_position";
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
  } else if (try_to_import_json(text)) {
    // if true(=success) do nothing
  } else {
    updateGlobal((g) => {
      g.dialog = "AddKozane";
      g.add_kozane_text = text;
    });
  }
};

type JSON_KozanebaV3 = {
  format: string;
  version: number;
  itemStore: { [key: string]: TItem };
  drawOrder: ItemId[];
};
const try_to_import_json = (text: string) => {
  try {
    const j: JSON_KozanebaV3 = JSON.parse(text);
    const items: ItemId[] = [];

    if (j.format === "Kozaneba" && j.version === 3) {
      updateGlobal((g) => {
        Object.entries(j.itemStore).forEach(([old_id, value]) => {
          const id = create_new_itemid();
          if (j.drawOrder.includes(old_id as ItemId)) {
            // it is top level
            items.push(id);
          }
          value.id = id;
          g.itemStore[id] = value;
        });
      });

      const group = new GroupItem();
      group.items = items;
      updateGlobal((g) => {
        g.drawOrder.push(group.id);
        g.itemStore[group.id] = group;
      });

      normalize_group_position(group.id);
      redraw();
      updateGlobal((g) => {
        g.itemStore[group.id]!.position = get_center_of_screen();
      });
    } else {
      // from Regroup?
      throw new Error("not implemented yet");
    }
    return true;
  } catch {
    return false;
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
