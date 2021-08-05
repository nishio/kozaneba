import firebase from "firebase";

export const signInAsAnonymousUser = () => {
  console.log("signInAsAnonymousUser");
  return firebase
    .auth()
    .signInAnonymously()
    .then(() => {
      console.log("done");
    });
};
