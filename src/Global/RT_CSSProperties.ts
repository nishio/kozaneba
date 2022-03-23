import { Unknown } from "runtypes";
import { CSSProperties } from "styled-components";

export const RT_CSSProperties = Unknown.withGuard(
  (x): x is CSSProperties => {
    return typeof x === "object";
  },
  { name: "RT_CSSProperties" }
);
