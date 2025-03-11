import { auth, googleAuthProvider } from "../Cloud/init_firebase";
import { signInWithPopup } from "firebase/auth";

export const onGoogleSignIn = () => {
  return signInWithPopup(auth, googleAuthProvider);
};
