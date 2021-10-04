import { auth, GoogleAuthProvider } from "../Cloud/init_firebase";

export const onGoogleSignIn = () => {
  const provider = new GoogleAuthProvider();
  return auth.signInWithPopup(provider);
};
