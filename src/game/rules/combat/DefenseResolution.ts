import type { CharacterStats } from "../stats/Stats";
import { getDexterityModifier } from "../stats/Stats";
import { rollPercentage } from "../dice/Dice";

export interface DefenseResult {
  hit: boolean;
  chance: number;
  roll: number;
}

export function resolvePhysicalDodge(
  defenderStats: CharacterStats,
): DefenseResult {
  const chance = clampPercentage(10 + getDexterityModifier(defenderStats) * 5);

  const roll = rollPercentage();
  return {
    hit: roll > chance,
    chance,
    roll,
  };
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(99, value));
}
