import { auth } from "../Cloud/init_firebase";

export const signOut = () => {
  return auth.signOut();
};
