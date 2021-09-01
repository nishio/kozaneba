import { kozaneba } from "../KozanebaAPI";
import { TUserMenu } from "../UserMenuItem";

export const copy_title: TUserMenu = {
  label: "copy title",
  onClick: () => {
    const item = kozaneba.get_clicked_item();
    if (item !== undefined) {
      navigator.clipboard.writeText(item.text);
    }
  },
};

export const onLoad = () => {
  kozaneba.user_menus.Scrapbox!.push(copy_title);
};
