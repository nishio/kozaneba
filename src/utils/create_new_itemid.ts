import { getGlobal } from "../Global/ReactnCompat";
import { TItemId } from "../Global/TItemId";

let last_timestamp = 0;
export const create_new_itemid = () => {
  let timestamp = Date.now();
  const fix = getGlobal().fix_timestamp_for_test;
  if (fix !== null && fix !== undefined) {
    timestamp = fix;
  }
  if (last_timestamp >= timestamp) {
    timestamp = last_timestamp + 1;
  }
  last_timestamp = timestamp;
  return timestamp.toString() as TItemId;
};
