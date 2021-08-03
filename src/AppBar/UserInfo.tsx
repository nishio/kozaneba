import React from "react";
import { useEffect } from "react";
import { useGlobal } from "reactn";

export const UserInfo = () => {
  const [user] = useGlobal("user");
  useEffect(() => {});
  if (user) {
    return (
      <span>
        {user.photoURL !== null ? (
          <img src={user.photoURL} alt="" width="16px" />
        ) : null}
        {user.displayName ?? "Anonymous"}
      </span>
    );
  } else {
    return <span>Not signed in</span>;
  }
};
