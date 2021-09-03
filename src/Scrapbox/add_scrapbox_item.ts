import { parse } from "@progfay/scrapbox-parser";
import { set_status } from "../Cloud/initial_save";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { updateGlobal } from "../Global/updateGlobal";
import { get_page_json, make_scrapbox_kozane } from "./make_scrapbox_kozane";

export const add_scrapbox_item = (url: string) => {
  const items = url.split("/");
  if (items.length < 5 || items[4] === "") {
    alert(`Pasted URL is not a scrapbox page, ignored: ${url}`);
    return;
  }

  updateGlobal((g) => {
    g.dialog = "Loading";
    g.statusBar.type = "downloading";
  });
  get_page_json(url)
    .then((x) => {
      make_scrapbox_kozane(x, url);
    })
    .then(() => {
      set_status("done");
      mark_local_changed();
    });
};

export const add_scrapbox_contents = (url: string) => {
  const items = url.split("/");
  if (items.length < 5 || items[4] === "") {
    alert(`Pasted URL is not a scrapbox page, ignored: ${url}`);
    return;
  }

  updateGlobal((g) => {
    g.dialog = "Loading";
    g.statusBar.type = "downloading";
  });
  fetch(
    "https://us-central1-regroup-d4932.cloudfunctions.net/get_scrapbox_page",
    {
      method: "post",
      body: JSON.stringify({ url }),
    }
  )
    .then((x) => {
      console.log(x.text);
    })
    .then(() => {
      set_status("done");
      mark_local_changed();
    });
};

export const parse_scrapbox = (text: string) => {
  return parse(text);
};
