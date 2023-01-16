import { set_status } from "../utils/set_status";
import { mark_local_changed } from "../utils/mark_local_changed";
import { create_squared_position } from "../dimension/create_squared_position";
import { get_center_of_screen } from "../dimension/get_center_of_screen";
import { TScrapboxItem } from "../Global/TScrapboxItem";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { create_new_itemid } from "../utils/create_new_itemid";
import { add_item } from "../API/add_item";
import {
  get_page_json,
  TScrapboxPage,
  make_scrapbox_url,
  TScrapboxPageJSON,
} from "./make_scrapbox_kozane";
import { SCRAPBOX_SIZE } from "./get_scrapbox_bounding_box";
import { create_kozane } from "../API/add_kozane";
import { url_to_text } from "../utils/url_to_text";
import { TWorldCoord } from "../dimension/world_to_screen";

export const add_urls = (urls: string[]) => {
  console.log(urls);
  updateGlobal((g) => {
    g.dialog = "Loading";
    g.statusBar.type = "downloading";
    g.menu = "";
  });

  const positions = create_squared_position(
    urls,
    SCRAPBOX_SIZE + 1,
    SCRAPBOX_SIZE + 1,
    -1
  );
  const group = new GroupItem();
  const url_to_item = async (url: string) => {
    if (url.startsWith("https://scrapbox.io")) {
      // scrapbox kozane
      console.log(url);
      return get_page_json(url).then((page) =>
        page_to_scrapbox_item(page, url)
      );
    } else {
      // extarnal kozane
      return create_kozane(url_to_text(url), { custom: { url } }); // [External Kozane]
    }
  };

  Promise.all(urls.map(url_to_item)).then((items) => {
    updateGlobal((g) => {
      items.forEach((item, index) => {
        const position = positions[index]!;
        item.position = position;
        g.itemStore[item.id] = item;
        group.items.push(item.id);
      });
      group.position = get_center_of_screen();
    });
    add_item(group);
    set_status("done");
    mark_local_changed();
  });
};

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
    if ("message" in x) {
      // page not found, not worth to expand links
      return;
    }
    const urls: string[] = [];
    const pages: TScrapboxPage[] = [];
    if (include_self) {
      pages.push(x);
      urls.push(url);
    }
    x.relatedPages.links1hop.forEach((x: TScrapboxPage) => {
      pages.push(x);
      urls.push(make_scrapbox_url(root, x.title));
    });
    if (include_2hop) {
      x.relatedPages.links2hop.forEach((x: TScrapboxPage) => {
        pages.push(x);
        urls.push(make_scrapbox_url(root, x.title));
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
        const scrapbox = page_to_scrapbox_item(page, url);
        const position = positions[index]!;
        scrapbox.position = position;
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

const page_to_scrapbox_item = (page: TScrapboxPageJSON, url: string): TScrapboxItem => {
  if ("message" in page) {
    const text = decodeURIComponent(url.split("/").slice(-1)[0]!)
    const scrapbox: TScrapboxItem = {
      id: create_new_itemid(),
      type: "scrapbox",
      text,
      image: "",
      url,
      description: [page.message],

      position: [0, 0] as TWorldCoord, // DUMMY
      scale: 1,
    };
    return scrapbox;

  } else {
    const text = page.title;
    const image = (page.image ?? "").replace("/raw", "");
    const descriptions = page.descriptions ?? [];
    const scrapbox: TScrapboxItem = {
      id: create_new_itemid(),
      type: "scrapbox",
      text,
      image,
      url,
      description: descriptions,

      position: [0, 0] as TWorldCoord, // DUMMY
      scale: 1,
    };
    return scrapbox;
  }
};
