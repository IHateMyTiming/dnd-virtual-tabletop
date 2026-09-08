import type { AttackType } from "../combat/Attack";
import type { ConditionState } from "./ConditionState";

const BLINDED_ACCURACY_MULTIPLIER = 0.5;

export function getConditionAccuracyMultiplier(
  conditions: ConditionState[],
  attackType: AttackType,
): number {
  let multiplier = 1;

  for (const condition of conditions) {
    if (condition.id !== "blinded") {
      continue;
    }

    if (attackType === "ranged") {
      multiplier *= BLINDED_ACCURACY_MULTIPLIER;
    }
  }

  return multiplier;
}
