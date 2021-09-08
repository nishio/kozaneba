import { getGlobal } from "reactn";

export const is_user_in_writers = () => {
  const g = getGlobal();
  if (g.user === null) return false;
  if (g.writers === undefined) return false;
  return g.writers.includes(g.user.uid);
};
