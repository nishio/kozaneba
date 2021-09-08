import { SCRAPBOX_SIZE } from "./Scrapbox";
import { set_status } from "../utils/set_status";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { create_squared_position } from "../dimension/create_squared_position";
import { get_center_of_screen } from "../dimension/get_center_of_screen";
import { TScrapboxItem } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { create_new_itemid } from "../utils/create_new_itemid";
import { add_item } from "../API/add_item";
import { get_page_json, TScrapboxPage, make_url } from "./make_scrapbox_kozane";

export const add_scrapbox_links = (
  url: string,
  include_self = true,
  include_2hop = true
) => {
  const m = url.match(/(.*?)\/([^/]*?)$/);
  if (m === null) {
    alert(`URL: ${url} is malformed and can not process, ignored.`);
    return;
  }
  const [, root] = m;
  if (root === undefined) {
    alert(`URL: ${url} is malformed and can not process, ignored.`);
    return;
  }

  updateGlobal((g) => {
    g.dialog = "Loading";
    g.statusBar.type = "downloading";
    g.menu = "";
  });
  get_page_json(url).then((x) => {
    const urls: string[] = [];
    const pages: TScrapboxPage[] = [];
    if (include_self) {
      pages.push(x);
      urls.push(url);
    }
    x.relatedPages.links1hop.forEach((x: TScrapboxPage) => {
      pages.push(x);
      urls.push(make_url(root, x.title));
    });
    if (include_2hop) {
      x.relatedPages.links2hop.forEach((x: TScrapboxPage) => {
        pages.push(x);
        urls.push(make_url(root, x.title));
      });
    }

    const positions = create_squared_position(
      urls,
      SCRAPBOX_SIZE + 1,
      SCRAPBOX_SIZE + 1,
      -1
    );
    const group = new GroupItem();

    updateGlobal((g) => {
      pages.forEach((page, index) => {
        const url = urls[index]!;
        const text = page.title;
        const image = (page.image ?? "").replace("/raw", "");
        const descriptions = page.descriptions;
        const position = positions[index]!;

        const scrapbox: TScrapboxItem = {
          id: create_new_itemid(),
          type: "scrapbox",
          text,
          image,
          url,
          description: descriptions,

          position,
          scale: 1,
        };
        g.itemStore[scrapbox.id] = scrapbox;
        group.items.push(scrapbox.id);
      });
      group.position = get_center_of_screen();
    });
    add_item(group);
    set_status("done");
    mark_local_changed();
  });
};
