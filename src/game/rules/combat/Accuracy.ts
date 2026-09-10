import type { CharacterStats } from "../stats/Stats";
import { getDexterityModifier } from "../stats/Stats";
import { getRangeAccuracy } from "./Range";
import { getTargetAccuracy } from "./TargetLocation";
import type { TargetLocation } from "./TargetLocation";
import type { ConditionState } from "../condition/ConditionState";
import { getConditionAccuracyMultiplier } from "../condition/ConditionAccuracy";
import { getDefenseStats } from "./Defense";

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
  target: TargetLocation,
  attackerConditions: ConditionState[] = [],
  patternBonus: number = 0,
): number {
  const attackerAccuracy = 100 + getDexterityModifier(attackerStats) * 5;

  const targetAccuracy = getTargetAccuracy(target);

  const conditionAccuracy = getConditionAccuracyMultiplier(
    attackerConditions,
    "melee",
  );

  const baseAccuracy =
    (attackerAccuracy / 100) * (targetAccuracy / 100) * conditionAccuracy * 100;

  return clampPercentage(baseAccuracy - patternBonus);
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function getSpellPrecision(intelligence: number): number {
  if (intelligence <= 8) return 40;
  if (intelligence === 9) return 45;
  if (intelligence <= 11) return 50;
  if (intelligence <= 13) return 60;
  if (intelligence <= 15) return 70;
  if (intelligence <= 17) return 80;
  return 100;
}

export function calculateSpellAccuracy(
  attackerStats: CharacterStats,
  defenderStats: CharacterStats,
): number {
  const spellPrecision = getSpellPrecision(attackerStats.intelligence);
  const spellDodge = getDefenseStats(defenderStats).spellDodge;

  return clampPercentage(
    (spellPrecision / 100) * ((100 - spellDodge) / 100) * 100,
  );
}
