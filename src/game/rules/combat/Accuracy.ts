import type { CharacterStats } from "../stats/Stats";
import { getDexterityModifier } from "../stats/Stats";
import { getRangeAccuracy } from "./Range";
import { getTargetAccuracy } from "./TargetLocation";
import type { TargetLocation } from "./TargetLocation";
import { getConditionDodgeMultiplier } from "../condition/ConditionDefense";
import type { ConditionState } from "../condition/ConditionState";
import { getConditionAccuracyMultiplier } from "../condition/ConditionAccuracy";

export function calculateRangedAccuracy(
  attackerStats: CharacterStats,
  distance: number,
  target: TargetLocation,
  attackerConditions: ConditionState[] = [],
): number {
  const rangeAccuracy =
    getRangeAccuracy(distance) + getDexterityModifier(attackerStats) * 5;

  const targetAccuracy = getTargetAccuracy(target);

  const conditionAccuracy = getConditionAccuracyMultiplier(
    attackerConditions,
    "ranged",
  );

  return clampPercentage(
    (rangeAccuracy / 100) * (targetAccuracy / 100) * conditionAccuracy * 100,
  );
}

export function calculateMeleeAccuracy(
  attackerStats: CharacterStats,
  targetStats: CharacterStats,
  target: TargetLocation,
  attackerConditions: ConditionState[] = [],
  defenderConditions: ConditionState[] = [],
): number {
  const attackerAccuracy = 100 + getDexterityModifier(attackerStats) * 5;

  const targetAccuracy = getTargetAccuracy(target);

  const baseEnemyDodge = 10 + getDexterityModifier(targetStats) * 5;

  const enemyDodge =
    baseEnemyDodge * getConditionDodgeMultiplier(defenderConditions);

  const conditionAccuracy = getConditionAccuracyMultiplier(
    attackerConditions,
    "melee",
  );

  return clampPercentage(
    (attackerAccuracy / 100) *
      (targetAccuracy / 100) *
      ((100 - enemyDodge) / 100) *
      conditionAccuracy *
      100,
  );
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, value));
}
