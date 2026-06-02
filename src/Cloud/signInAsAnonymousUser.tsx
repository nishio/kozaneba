import { auth } from "./init_firebase";
import { dev_log } from "../utils/dev";


export const signInAsAnonymousUser = () => {
  dev_log("signInAsAnonymousUser");
  return auth.signInAnonymously().then(() => {
    dev_log("done");
  });
};
