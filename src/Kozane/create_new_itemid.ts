import { getGlobal } from "reactn";
import { ItemId } from "../Global/initializeGlobalState";

export const create_new_itemid = () => {
  let timestamp = Date.now();
  const fix = getGlobal().fix_timestamp_for_test;
  if (fix !== null) {
    timestamp = fix;
  }
  if (last_timestamp >= timestamp) {
    timestamp = last_timestamp + 1;
  }
  last_timestamp = timestamp;
  return timestamp.toString() as ItemId;
};
let last_timestamp = 0;
