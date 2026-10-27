import { getGlobal } from "reactn";
import { is_user_in_writers } from "./is_user_in_writers";

export const can_write = () => {
  const g = getGlobal();
  return g.anyone_writable || is_user_in_writers();
};

// The creator of the ba is writers[0] (initial_save / make_copy put them
// there, if_not_in_writer_add_self only appends). firestore.rules lets only
// this user change anyone_writable.
export const is_ba_owner = () => {
  const g = getGlobal();
  if (g.user === null) return false;
  if (g.writers === undefined || g.writers.length === 0) return false;
  return g.writers[0] === g.user.uid;
};

export const is_cloud = () => {
  const g = getGlobal();
  return g.cloud_ba !== "";
};
