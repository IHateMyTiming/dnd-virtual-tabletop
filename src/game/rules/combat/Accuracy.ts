import type { CharacterStats } from "../stats/Stats";
import { getDexterityModifier } from "../stats/Stats";
import { getRangeAccuracy } from "./Range";
import { getTargetAccuracy } from "./TargetLocation";
import type { TargetLocation } from "./TargetLocation";

export function calculateRangedAccuracy(
  attackerStats: CharacterStats,
  distance: number,
  target: TargetLocation,
): number {
  const rangeAccuracy = clampPercentage(
    getRangeAccuracy(distance) + getDexterityModifier(attackerStats) * 5,
  );

  const targetAccuracy = getTargetAccuracy(target);

  return clampPercentage((rangeAccuracy / 100) * (targetAccuracy / 100) * 100);
}

export function calculateMeleeAccuracy(
  attackerStats: CharacterStats,
  targetStats: CharacterStats,
  target: TargetLocation,
): number {
  const attackerAccuracy = clampPercentage(
    100 + getDexterityModifier(attackerStats) * 5,
  );

  const targetAccuracy = getTargetAccuracy(target);

  const enemyDodge = 10 + getDexterityModifier(targetStats) * 5;

  return clampPercentage(
    (attackerAccuracy / 100) *
      (targetAccuracy / 100) *
      ((100 - enemyDodge) / 100) *
      100,
  );
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, value));
}
