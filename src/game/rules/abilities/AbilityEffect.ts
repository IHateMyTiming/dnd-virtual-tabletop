import type { DamageExpression } from "../combat/Damage";
import type { ConditionId } from "../condition/Condition";

export type AbilityEffectType =
  | "damage"
  | "heal"
  | "apply-condition"
  | "remove-condition"
  | "move"
  | "teleport"
  | "modify-stat";

export interface AbilityEffect {
  type: AbilityEffectType;
  value?: number;
  damage?: DamageExpression;
  conditionId?: ConditionId;
  duration?: number;
  stacks?: number;
  distance?: number;
}
