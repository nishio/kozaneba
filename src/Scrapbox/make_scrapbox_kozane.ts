import { get_center_of_screen } from "../dimension/get_center_of_screen";
import { TWorldCoord } from "../dimension/world_to_screen";
import { TScrapboxItem } from "../Global/initializeGlobalState";
import { create_new_itemid } from "../Kozane/create_new_itemid";
import { add_item } from "../API/add_item";

export type TScrapboxPage = {
  title: string;
  image: string | null;
  descriptions: string[];
};

export const make_scrapbox_kozane = (x: TScrapboxPage, url: string) => {
  add_scrapbox_item_raw({
    text: x.title,
    url: url,
    image: (x.image ?? "").replace("/raw", ""),
    descriptions: x.descriptions,
  });
};

export const get_page_json = (url: string) => {
  return fetch_api(url).then((x) => x.json());
};

export const fetch_api = (url: string) => {
  return fetch(
    "https://us-central1-regroup-d4932.cloudfunctions.net/get_scrapbox_page",
    {
      method: "post",
      body: JSON.stringify({ url }),
    }
  );
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

export const make_url = (root: string, title: string) => {
  return root + "/" + encodeURIComponent(title);
};
