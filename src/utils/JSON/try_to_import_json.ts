import { ItemId } from "../../Global/ItemId";
import { TItem } from "../../Global/TItem";
import { TAnnotation } from "../../Global/TAnnotation";
import { do_kozaneba_v3 } from "./do_kozaneba_v3";
import { do_kozaneba_v4 } from "./do_kozaneba_v4";

export const try_to_import_json = (text: string) => {
  try {
    const j: any = JSON.parse(text);

    if (j.format === "Kozaneba" && j.version === 3) {
      do_kozaneba_v3(j);
    } else if (j.format === "Kozaneba" && j.version === 4) {
      do_kozaneba_v4(j);
    } else {
      // from Regroup?
      throw new Error("not implemented yet");
    }
    return true;
  } catch {
    return false;
  }
};
