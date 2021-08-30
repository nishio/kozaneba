import { get_center_of_screen } from "../Dialog/AddKozaneDialog/get_center_of_screen";
import { TScrapboxItem } from "../Global/initializeGlobalState";
import { create_new_itemid } from "../Kozane/create_new_itemid";
import { add_item } from "./add_item";

type TScrapboxPage = {
  title: string;
  image: string | null;
  descriptions: string[];
};

const make_scrapbox_kozane = (x: TScrapboxPage, url: string) => {
  console.log(url);
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
}) => {
  const { text, image, url, descriptions } = props;
  const scrapbox: TScrapboxItem = {
    id: create_new_itemid(),
    type: "scrapbox",
    text: text,
    image: image ?? "",
    url: url ?? "",
    description: descriptions ?? [],

    position: get_center_of_screen(),
    scale: 1,
  };
  add_item(scrapbox);
};

export const add_scrapbox_item = (url: string) => {
  get_page_json(url).then((x) => {
    make_scrapbox_kozane(x, url);
  });
};

const make_url = (root: string, title: string) => {
  return root + "/" + encodeURIComponent(title);
};

export const add_scrapbox_links = (url: string) => {
  const m = url.match(/(.*?)\/([^/]*?)$/);
  if (m === null) return;
  const [, root] = m;
  get_page_json(url).then((x) => {
    make_scrapbox_kozane(x, url);
    x.relatedPages.links1hop.forEach((x: TScrapboxPage) => {
      make_scrapbox_kozane(x, make_url(root!, x.title));
    });
    x.relatedPages.links2hop.forEach((x: TScrapboxPage) => {
      make_scrapbox_kozane(x, make_url(root!, x.title));
    });
  });
};
