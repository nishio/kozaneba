import { ItemId } from "../Global/initializeGlobalState";

export type TGroupItem = {
  type: "group";
  title: string;
  position: number[];
  items: ItemId[];
  id: ItemId;
  scale: number; // scale of Nameplate Fusen
  isOpen: boolean;
};
