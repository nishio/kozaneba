import { Static, String } from "runtypes";

export const RTItemId = String.withBrand("ItemId");
export type TItemId = Static<typeof RTItemId>;
