import { State } from "../Global/ReactnCompat";
import { updateGlobal } from "./updateGlobal";

export const update_global_with_optional_draft = (
  draft: State | undefined,
  f: (g: State) => void
): void => {
  if (draft === undefined) {
    updateGlobal(f);
  } else {
    f(draft);
  }
};
