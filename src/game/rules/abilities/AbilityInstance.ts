import type { Position } from "../combat/Movement";
import type { AbilityArea } from "./Ability";

export interface AbilityInstance {
  id: string;

  abilityId: string;
  casterId: string;

  position: Position;
  area: AbilityArea;

  hp?: number;
  maxHp?: number;

  duration?: number;
}
