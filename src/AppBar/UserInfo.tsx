import firebase from "firebase";
import React from "react";
import { useEffect, useState } from "react";

export const UserInfo = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });
  });
  if (user) {
    return <span>{user.displayName ?? "Anonymous"}</span>;
  } else {
    return <span>Not signed in</span>;
  }
};
