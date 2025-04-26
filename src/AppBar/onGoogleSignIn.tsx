import { auth, GoogleAuthProvider } from "../Cloud/init_firebase";
import { signInWithPopup } from "firebase/auth";

export const onGoogleSignIn = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};
