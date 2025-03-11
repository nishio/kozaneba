import { auth } from "./init_firebase";
import { signInAnonymously } from "firebase/auth";

export const signInAsAnonymousUser = () => {
  console.log("signInAsAnonymousUser");
  return signInAnonymously(auth).then(() => {
    console.log("done");
  });
};
