import type { ConditionState } from "./ConditionState";

export function getIncomingDamageMultiplier(
  conditions: ConditionState[],
): number {
  return conditions.reduce((multiplier, condition) => {
    if (
      condition.id !== "marked" &&
      condition.id !== "petrified" &&
      condition.id !== "cursed"
    ) {
      return multiplier;
    }

    const value = condition.value ?? 0;

    return multiplier * (1 + value / 100);
  }, 1);
}
