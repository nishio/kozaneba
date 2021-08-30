import { SCRAPBOX_SIZE } from "../Canvas/Scrapbox";
import { set_status } from "../Cloud/initial_save";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { create_squared_position } from "../Dialog/AddKozaneDialog/add_multiple_kozane";
import { get_center_of_screen } from "../Dialog/AddKozaneDialog/get_center_of_screen";
import { TWorldCoord } from "../dimension/world_to_screen";
import { TScrapboxItem } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { create_new_itemid } from "../Kozane/create_new_itemid";
import { add_item } from "./add_item";

type TScrapboxPage = {
  title: string;
  image: string | null;
  descriptions: string[];
};

const make_scrapbox_kozane = (x: TScrapboxPage, url: string) => {
  add_scrapbox_item_raw({
    text: x.title,
    url: url,
    image: (x.image ?? "").replace("/raw", ""),
    descriptions: x.descriptions,
  });
};

const get_page_json = (url: string) => {
  return fetch(
    "https://us-central1-regroup-d4932.cloudfunctions.net/get_scrapbox_page",
    {
      method: "post",
      body: JSON.stringify({ url }),
    }
  ).then((x) => x.json());
};

const add_scrapbox_item_raw = (props: {
  text: string;
  url?: string;
  image?: string;
  descriptions?: string[];
  position?: TWorldCoord;
}) => {
  const { text, image, url, descriptions, position } = props;
  const scrapbox: TScrapboxItem = {
    id: create_new_itemid(),
    type: "scrapbox",
    text: text,
    image: image ?? "",
    url: url ?? "",
    description: descriptions ?? [],

    position: position ?? get_center_of_screen(),
    scale: 1,
  };
  add_item(scrapbox);
};

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

const make_url = (root: string, title: string) => {
  return root + "/" + encodeURIComponent(title);
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
