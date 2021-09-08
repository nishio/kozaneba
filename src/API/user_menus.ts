import { TMenu } from "../Global/TMenu";
import { TUserMenu } from "./UserMenuItem";

export const user_menus: Partial<
  {
    [key in TMenu]: TUserMenu[];
  }
> = {
  Main: [],
  Kozane: [],
  Group: [],
  Selection: [],
  Gyazo: [],
  Scrapbox: [],
};
