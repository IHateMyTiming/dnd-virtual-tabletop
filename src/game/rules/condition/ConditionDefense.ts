import type { ConditionState } from "./ConditionState";

export function getConditionDodgeMultiplier(
  conditions: ConditionState[],
): number {
  return conditions.reduce((multiplier, condition) => {
    if (condition.id !== "blinded") {
      return multiplier;
    }

    const percentage = condition.value ?? 100;

    return multiplier * (percentage / 100);
  }, 1);
}
