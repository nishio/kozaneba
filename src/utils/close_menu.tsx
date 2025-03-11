import { setGlobal } from "../Global/ReactnCompat";

export const close_menu = () => {
  setGlobal({ menu: "" });
};

export const close_menu_and_dialog = () => {
  // close menu and dialog
  setGlobal({ menu: "", dialog: "" });
};
