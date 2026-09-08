import type { CharacterStats } from "../stats/Stats";
import { getStrengthModifier } from "../stats/Stats";

export function calculateParryReduction(
  stats: CharacterStats,
  incomingDamage: number,
): number {
  const strengthModifier = getStrengthModifier(stats);

  const reduction = Math.max(0, strengthModifier * 2);

  return Math.min(reduction, incomingDamage);
}

export function applyParry(
  stats: CharacterStats,
  incomingDamage: number,
): number {
  const reduction = calculateParryReduction(stats, incomingDamage);

  return Math.max(0, incomingDamage - reduction);
}
