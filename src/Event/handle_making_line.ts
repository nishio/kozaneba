import { getGlobal } from "reactn";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { dev_log } from "../utils/dev";
import { kozaneba } from "../API/KozanebaAPI";
import { TAnnotation } from "../Global/TAnnotation";
import { mark_local_changed } from "../utils/mark_local_changed";

export const handle_making_line = (id: TItemId) => {
  const g = getGlobal();
  updateGlobal((g) => {
    g.mouseState = "";
  });
  dev_log("add line", g.line_start, id, g.line_type);
  if (g.line_start !== "" && g.line_start !== id) {
    switch (g.line_type) {
      case "line":
        kozaneba.add_arrow([g.line_start, id], ["none", "none"]);
        break;
      case "arrow":
        kozaneba.add_arrow([g.line_start, id], ["none", "arrow"]);
        break;
      case "double_heads":
        kozaneba.add_arrow([g.line_start, id], ["arrow", "arrow"]);
        break;
      case "double_lines":
        kozaneba.add_arrow([g.line_start, id], ["none", "none"], true);
        break;
      case "delete":
        const start = g.line_start,
          end = id;
        const new_annot = g.annotations.filter((a: TAnnotation) => {
          if (a.items.length !== 2) {
            return true;
          }
          const [v1, v2] = a.items;
          if ((v1 === start && v2 === end) || (v2 === start && v1 === end)) {
            return false;
          }
          return true;
        });
        updateGlobal((g) => {
          g.annotations = new_annot;
        });
        mark_local_changed();
    }
  }
};
