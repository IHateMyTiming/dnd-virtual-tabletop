import type { ConditionState } from "./ConditionState";

const BLINDED_DODGE_MULTIPLIER = 2;

export function getConditionDodgeMultiplier(
  conditions: ConditionState[],
): number {
  let multiplier = 1;

  for (const condition of conditions) {
    if (condition.id !== "blinded") {
      continue;
    }

    multiplier *= BLINDED_DODGE_MULTIPLIER;
  }

  return multiplier;
}
