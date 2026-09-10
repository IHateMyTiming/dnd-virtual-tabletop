import type { ConditionState } from "./ConditionState";

export function getConditionAccuracyMultiplier(
  conditions: ConditionState[],
  attackType: "melee" | "ranged",
): number {
  return conditions.reduce((multiplier, condition) => {
    if (condition.id !== "blinded" || attackType !== "ranged") {
      return multiplier;
    }

    const percentage = condition.value ?? 100;

    return multiplier * (percentage / 100);
  }, 1);
}
