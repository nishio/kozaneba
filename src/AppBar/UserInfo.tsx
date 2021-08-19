import React from "react";
import { useEffect } from "react";
import { getGlobal, useGlobal } from "reactn";

export const UserInfo = () => {
  const [user] = useGlobal("user");
  useEffect(() => {});
  if (user) {
    return (
      <span>
        {user.photoURL !== null ? (
          <img src={user.photoURL} alt="" width="16px" />
        ) : null}
        {get_display_name()}
      </span>
    );
  } else {
    return <span>Not signed in</span>;
  }
};

export const get_display_name = () => {
  return getGlobal().user?.displayName ?? "Anonymous";
};
