import type { ConditionId } from "./Condition";
import type { ConditionState } from "./ConditionState";

export function hasCondition(
  conditions: ConditionState[],
  conditionId: ConditionId,
): boolean {
  return conditions.some((condition) => condition.id === conditionId);
}

export function canMove(conditions: ConditionState[]): boolean {
  if (hasCondition(conditions, "stunned")) return false;
  if (hasCondition(conditions, "rooted")) return false;
  if (hasCondition(conditions, "suppressed")) return false;

  return true;
}

export function canUseAction(conditions: ConditionState[]): boolean {
  if (hasCondition(conditions, "stunned")) return false;
  if (hasCondition(conditions, "petrified")) return false;
  if (hasCondition(conditions, "sleeping")) return false;

  return true;
}

export function canUseBonusAction(conditions: ConditionState[]): boolean {
  if (hasCondition(conditions, "stunned")) return false;
  if (hasCondition(conditions, "freezed")) return false;
  if (hasCondition(conditions, "petrified")) return false;
  if (hasCondition(conditions, "sleeping")) return false;

  return true;
}

export function canUseReaction(conditions: ConditionState[]): boolean {
  if (hasCondition(conditions, "stunned")) return false;
  if (hasCondition(conditions, "petrified")) return false;
  if (hasCondition(conditions, "sleeping")) return false;

  return true;
}

export function canUseSpells(conditions: ConditionState[]): boolean {
  if (hasCondition(conditions, "stunned")) return false;
  if (hasCondition(conditions, "suppressed")) return false;
  if (hasCondition(conditions, "silenced")) return false;
  if (hasCondition(conditions, "sleeping")) return false;

  return true;
}

export function canUseSpecialMovement(conditions: ConditionState[]): boolean {
  if (hasCondition(conditions, "stunned")) return false;
  if (hasCondition(conditions, "freezed")) return false;
  if (hasCondition(conditions, "rooted")) return false;
  if (hasCondition(conditions, "suppressed")) return false;

  return true;
}
