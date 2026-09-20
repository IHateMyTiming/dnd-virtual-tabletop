import type { Position } from "../combat/Movement";
import type { AbilityArea } from "./Ability";
import type { AbilityEffect, AbilityInstanceTrigger } from "./AbilityEffect";

export interface AbilityInstanceEffect {
  trigger: AbilityInstanceTrigger;
  effect: AbilityEffect;
}

export interface AbilityInstance {
  id: string;
  abilityId: string;
  casterId: string;

  position: Position;
  area: AbilityArea;

  hp?: number;
  maxHp?: number;

  armor?: number;
  magicResistance?: number;

  duration?: number;

  disarmable?: boolean;
  disarmDC?: number;
  disarmRange?: number;

  blocksDamage?: boolean;

  effects?: AbilityInstanceEffect[];
}
