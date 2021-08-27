import { getGlobal } from "reactn";
import { is_user_in_writers } from "./LocalChangeWatcher";

export const can_write = () => {
  const g = getGlobal();
  return g.anyone_writable || is_user_in_writers();
};
