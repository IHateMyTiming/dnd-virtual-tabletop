import type { DamageExpression } from "../combat/Damage";
import type { ConditionId } from "../condition/Condition";
import type { CombatModifier } from "../combat/CombatModifier";
import type { CreatureType } from "../combat/Combatant";

export type AbilityEffectType =
  | "damage"
  | "heal"
  | "apply-condition"
  | "remove-condition"
  | "move"
  | "teleport"
  | "modify-stat"
  | "modify-behavior";

export interface AbilityEffect {
  type: AbilityEffectType;
  value?: number;
  damage?: DamageExpression;
  healing?: DamageExpression;
  conditionId?: ConditionId;
  duration?: number;
  stacks?: number;
  distance?: number;
  modifier?: CombatModifier;
  targetCreatureType?: CreatureType;

  areaDamage?: {
    falloff: number;
  };
}
