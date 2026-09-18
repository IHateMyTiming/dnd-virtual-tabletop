import type { CombatActionType } from "../combat/Action";
import type { AttackType } from "../combat/Attack";
import type { AbilityEffect } from "./AbilityEffect";
import type { SpellSlotLevel } from "./Resource";

export type AbilityTargetType =
  | "self"
  | "ally"
  | "enemy"
  | "self-or-ally"
  | "location";

export type AbilityTargetingMode = "single" | "multi" | "area" | "chain";
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

export type AbilityDefinition =
  | AbilitySingleTarget
  | AbilityMultiTarget
  | AbilityAreaTarget
  | AbilityChainTarget;

interface AbilityBase {
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

  spellLevel?: SpellSlotLevel;

  instance?: {
    lifetime?:
      | "permanent"
      | "duration"
      | "until-destroyed"
      | "until-disarmed-or-destroyed";

    hp?: number;
    maxHp?: number;
    armor?: number;
    magicResistance?: number;
    duration?: number;
    disarmable?: boolean;
  };

  imagePath?: string;
}

export interface AbilitySingleTarget extends AbilityBase {
  targetingMode: "single";
}

export interface AbilityMultiTarget extends AbilityBase {
  targetingMode: "multi";
  maxTargets: number;
}

export interface AbilityAreaTarget extends AbilityBase {
  targetingMode: "area";
  area: AbilityArea;
}
export interface AbilityChainTarget extends AbilityBase {
  targetingMode: "chain";
  maxTargets: number;
  chainRange: number;
}
