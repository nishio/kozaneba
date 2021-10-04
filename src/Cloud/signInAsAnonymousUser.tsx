import { auth } from "./init_firebase";

export const signInAsAnonymousUser = () => {
  console.log("signInAsAnonymousUser");
  return auth.signInAnonymously().then(() => {
    console.log("done");
  });
};
