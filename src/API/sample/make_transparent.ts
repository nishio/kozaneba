import { kozaneba } from "../KozanebaAPI";
import { TUserMenu } from "../UserMenuItem";

export const make_transparent: TUserMenu = {
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

export const onLoad = () => {
  kozaneba.user_menus.Gyazo!.push(make_transparent);
};
