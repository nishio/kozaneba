import { ItemId } from "../Global/initializeGlobalState";

export const create_new_itemid = () => {
  let timestamp = Date.now();
  if (last_timestamp >= timestamp) {
    timestamp = last_timestamp + 1;
  }
  last_timestamp = timestamp;
  console.log("timestamp:", timestamp);
  return timestamp.toString() as ItemId;
};
let last_timestamp: number;
