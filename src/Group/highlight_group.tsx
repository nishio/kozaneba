import {
  GROUP_HIGHLIGHTED_BORDER_COLOR,
  GROUP_BORDER_COLOR,
} from "../utils/group_constants";
import { TItemId } from "../Global/TItemId";
import { find_parent } from "../utils/find_parent";

export const highlight_group = (gid: TItemId, on: boolean) => {
  const e = document.getElementById("group-" + gid) as HTMLDivElement;
  if (on) {
    e.style.borderColor = GROUP_HIGHLIGHTED_BORDER_COLOR;
  } else {
    e.style.borderColor = GROUP_BORDER_COLOR;
  }
};

export const highlight_parent = (id: TItemId, on: boolean) => {
  const p = find_parent(id);
  if (p !== null) {
    highlight_group(p, on);
  }
};
