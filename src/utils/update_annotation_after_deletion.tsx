import { getGlobal } from "reactn";
import { State } from "reactn/default";
import { ItemId } from "../Global/ItemId";
import { TAnnotation } from "../Global/TAnnotation";
import { remove_item_from } from "./remove_item_from";

export const update_annotation_after_deletion = (g: State, id: ItemId) => {
  const new_annotation: TAnnotation[] = [];
  g.annotations.forEach((a) => {
    if (a.type === "line") {
      if (a.items.includes(id)) {
        const i = a.items.indexOf(id);
        a.items.splice(i, 1);
        a.heads.splice(i, 1);
      }
      if (a.items.length < 2) {
        // delete
        return;
      }
    }
    new_annotation.push(a);
  });
  console.log(getGlobal().annotations);
  g.annotations = new_annotation;
  console.log(new_annotation);
};
