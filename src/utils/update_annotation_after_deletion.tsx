import { State } from "../Global/ReactnCompat";
import { TItemId } from "../Global/TItemId";
import { TAnnotation } from "../Global/TAnnotation";

export const update_annotation_after_deletion = (g: State, id: TItemId) => {
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
  g.annotations = new_annotation;
};
