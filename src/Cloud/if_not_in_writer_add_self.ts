import { updateGlobal } from "../Global/updateGlobal";
import { get_user_id } from "./get_user_id";

export const if_not_in_writer_add_self = () => {
  // if not in writer, add self
  const uid = get_user_id();
  updateGlobal((g) => {
    if (!g.writers.includes(uid)) {
      g.writers.push(uid);
    }
  });
};
