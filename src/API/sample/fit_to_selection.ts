import { kozaneba } from "../KozanebaAPI";
import { TUserMenu } from "../UserMenuItem";

export const fit_to_selection: TUserMenu = {
  label: "fit to",
  onClick: () => {
    kozaneba.fit_to_contents(kozaneba.get_selected_ids());
    kozaneba.reset_selection();
  },
};

export const onLoad = () => {
  kozaneba.user_menus.Selection!.push(fit_to_selection);
};
