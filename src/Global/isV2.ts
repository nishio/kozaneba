import { V2 } from "../dimension/V2";

export function isV2(x: any): x is V2 {
  return Array.isArray(x) && x.length === 2;
}
