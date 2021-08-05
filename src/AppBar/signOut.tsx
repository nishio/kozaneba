import firebase from "firebase";

export const signOut = () => {
  console.log("sign out");
  return firebase.auth().signOut();
};
