import type { CombatActionType } from "../combat/Action";
import type { AttackType } from "../combat/Attack";
import type { AbilityEffect } from "./AbilityEffect";
import type { SpellSlotLevel } from "./Resource";

export type AbilityTargetType = "self" | "ally" | "enemy" | "area";

export type AbilityRecovery =
  | "unlimited"
  | "cooldown"
  | "short-rest"
  | "long-rest";

export interface AbilityResourceCost {
  spellSlotLevel?: SpellSlotLevel;
  amount: number;
}

export interface AbilityDefinition {
  id: string;
  nameKey: string;
  descriptionKey: string;
  actionType: CombatActionType;
  targetType: AbilityTargetType;
  attackType?: AttackType;
  range?: number;
  effects: AbilityEffect[];
  recovery: AbilityRecovery;
  cooldown?: number;
  resourceCost?: AbilityResourceCost;
  isSpell?: boolean;
}
