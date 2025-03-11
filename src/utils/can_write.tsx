import { getGlobal } from "../Global/ReactnCompat";
import { is_user_in_writers } from "./is_user_in_writers";

export const can_write = () => {
  const g = getGlobal();
  return g.anyone_writable || is_user_in_writers();
};

export const is_cloud = () => {
  const g = getGlobal();
  return g.cloud_ba !== "";
};
