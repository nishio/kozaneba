import { CSSProperties } from "react";
import { Unknown } from "runtypes";

export const RT_CSSProperties = Unknown.withGuard(
  (x): x is CSSProperties => {
    return typeof x === "object";
  },
  { name: "RT_CSSProperties" }
);
