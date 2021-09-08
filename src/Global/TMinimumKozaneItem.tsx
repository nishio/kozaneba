import { TWorldCoord } from "../dimension/world_to_screen";
import { NameplateId } from "./NameplateId";

export type TMinimumKozaneItem = {
  text: string;
  scale: number;
  position: TWorldCoord;
  id: NameplateId;
};
