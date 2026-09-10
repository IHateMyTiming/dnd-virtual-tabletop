import type { ConditionState } from "./ConditionState";

export function getConditionMovementMultiplier(
  conditions: ConditionState[],
): number {
  return conditions.reduce((multiplier, condition) => {
    if (condition.id !== "slowed" && condition.id !== "freezed") {
      return multiplier;
    }

    const percentage = condition.value ?? 100;

    return multiplier * (percentage / 100);
  }, 1);
}
