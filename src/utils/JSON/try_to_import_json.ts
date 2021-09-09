import { do_kozaneba_v3 } from "./do_kozaneba_v3";
import { do_kozaneba_v4 } from "./do_kozaneba_v4";

export const try_to_import_json = (text: string) => {
  // return is_succeeded
  try {
    const j: any = JSON.parse(text);
    let is_succeeded = false;
    if (j.format === "Kozaneba" && j.version === 3) {
      do_kozaneba_v3(j);
      is_succeeded = true;
    } else if (j.format === "Kozaneba" && j.version === 4) {
      is_succeeded = do_kozaneba_v4(j);
    } else {
      // from Regroup?
      console.error(`unknown format:${j.format} version:${j.version}`);
    }
    if (!is_succeeded) {
      alert(
        "The pasted text is JSON, but it is not valid. See console for detail."
      );
      return false;
    }
    return true;
  } catch {
    return false;
  }
};
