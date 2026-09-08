import type { ConditionState } from "./ConditionState";

const CONDITION_MOVEMENT_MULTIPLIERS: Record<string, number> = {
  slowed: 0.5,
  freezed: 0.5,
};

export function getConditionMovementMultiplier(
  conditions: ConditionState[],
): number {
  let multiplier = 1;

  for (const condition of conditions) {
    const conditionMultiplier = CONDITION_MOVEMENT_MULTIPLIERS[condition.id];

    if (conditionMultiplier === undefined) {
      continue;
    }

    multiplier *= conditionMultiplier;
  }

  return multiplier;
}
