import { ItemId } from "../Global/initializeGlobalState";

export type TFusenItem = {
  type: "piece";
  text: string;
  position: number[];
  id: ItemId;
  scale: number;
};
