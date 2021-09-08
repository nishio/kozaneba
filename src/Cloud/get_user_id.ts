import { auth } from "./FirestoreIO";

export const get_user_id = (): string => {
  const uid = auth.currentUser?.uid;
  if (uid === undefined) {
    throw new Error("Assertion: user should be signed in");
  }
  return uid;
};
