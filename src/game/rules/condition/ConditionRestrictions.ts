import type { ConditionId } from "./Condition";
import type { ConditionState } from "./ConditionState";
import { calculateDistance } from "../combat/Movement";
import type { Combatant } from "../combat/Combatant";
import type { Position } from "../combat/Movement";

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

export function canAttackTarget(
  attackerId: string,
  targetId: string,
  conditions: ConditionState[],
): boolean {
  return !conditions.some(
    (condition) =>
      condition.id === "charmed" && condition.sourceId === targetId,
  );
}

export function canMoveTo(
  currentPosition: Position,
  targetPosition: Position,
  conditions: ConditionState[],
  combatants: Combatant[],
): boolean {
  const charmed = conditions.find(
    (condition) => condition.id === "charmed" && condition.sourceId,
  );

  const frightened = conditions.find(
    (condition) => condition.id === "frightened" && condition.sourceId,
  );

  // Charmed: cannot voluntarily move farther away
  // from the creature that charmed you.
  if (charmed) {
    const source = combatants.find(
      (combatant) => combatant.id === charmed.sourceId,
    );

    if (source) {
      const currentDistance = calculateDistance(
        currentPosition,
        source.position,
      );

      const targetDistance = calculateDistance(targetPosition, source.position);

      if (targetDistance > currentDistance) {
        return false;
      }
    }
  }

  // Frightened: cannot voluntarily move closer
  // to the creature that frightened you.
  if (frightened) {
    const source = combatants.find(
      (combatant) => combatant.id === frightened.sourceId,
    );

    if (source) {
      const currentDistance = calculateDistance(
        currentPosition,
        source.position,
      );

      const targetDistance = calculateDistance(targetPosition, source.position);

      if (targetDistance < currentDistance) {
        return false;
      }
    }
  }

  return true;
}
