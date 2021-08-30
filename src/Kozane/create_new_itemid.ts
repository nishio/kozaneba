import { getGlobal } from "reactn";
import { ItemId } from "../Global/initializeGlobalState";

let last_timestamp = 0;
export const create_new_itemid = () => {
  let timestamp = Date.now();
  console.log(timestamp);
  const fix = getGlobal().fix_timestamp_for_test;
  console.log(timestamp);
  if (fix !== null && fix !== undefined) {
    timestamp = fix;
  }
  console.log(timestamp);
  if (last_timestamp >= timestamp) {
    timestamp = last_timestamp + 1;
  }
  console.log(timestamp);
  last_timestamp = timestamp;
  console.log(timestamp);
  return timestamp.toString() as ItemId;
};
