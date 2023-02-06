import { TItemId } from "../../Global/TItemId";
import { kozaneba } from "../KozanebaAPI";

export const add_bipartite = (
  targets: TItemId[],
  is_doubled = false,
  is_arrow = true
) => {
  if (targets.length < 2) return;
  const positions = targets.map((id) => kozaneba.get_item(id).position);
  const gp = kozaneba.get_middle_point(positions);
  const lefts = targets.filter((_, index) => positions[index]![0] <= gp[0]);
  const rights = targets.filter((_, index) => positions[index]![0] > gp[0]);
  const head = is_arrow ? "arrow" : "none";
  lefts.forEach((left) => {
    rights.forEach((right) => {
      kozaneba.add_arrow([left, right], ["none", head], is_doubled);
    });
  });
};

// This user menu changed to an official menu

// kozaneba.user_menus.Selection!.push({
//   label: "add bipartite graph",
//   onClick: () => {
//     add_bipartite(kozaneba.get_selected_ids());
//     kozaneba.reset_selection();
//     kozaneba.redraw();
//   },
// });
