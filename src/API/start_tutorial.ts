import { updateGlobal } from "../Global/updateGlobal";

export function start_tutorial() {
  updateGlobal((g) => {
    g.dialog = "Tutorial";
    g.in_tutorial = true;
    g.tutorial_page = 0;
  });
}
