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

export type AbilityAreaShape =
  | "circle"
  | "rectangle"
  | "line"
  | "cone"
  | "grid";

export interface AbilityArea {
  shape: AbilityAreaShape;

  width?: number;
  height?: number;
  radius?: number;

  pattern?: boolean[][];
}

export interface AbilityResourceCost {
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

  maxTargets?: number;

  area?: AbilityArea;

  effects: AbilityEffect[];

  recovery: AbilityRecovery;
  cooldown?: number;

  resourceCost?: AbilityResourceCost;

  isSpell?: boolean;
  spellLevel?: SpellSlotLevel;

  imagePath?: string;
}
