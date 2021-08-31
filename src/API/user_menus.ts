import { TMenu } from "../Global/initializeGlobalState";
import { kozaneba } from "./KozanebaAPI";
import { TUserMenu } from "./UserMenuItem";

const make_transparent: TUserMenu = {
  label: "make transparent",
  onClick: () => {
    const g = kozaneba.get_global();
    console.log("onClick", g.clicked_target);
    if (g.clicked_target === "") return;
    kozaneba.update_style(g.clicked_target, (style) => {
      style.mixBlendMode = "multiply";
      style.border = "none";
      return style;
    });
    kozaneba.redraw();
  },
};

export const user_menus: Partial<
  {
    [key in TMenu]: TUserMenu[];
  }
> = {
  Main: [],
  Kozane: [],
  Group: [],
  Selection: [],
  Gyazo: [make_transparent],
  Scrapbox: [],
};
