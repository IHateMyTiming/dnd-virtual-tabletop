import type { CharacterStats } from "../stats/Stats";

export function getParryReductionPercentage(strength: number): number {
  if (strength <= 8) return 10;
  if (strength <= 12) return 15;
  if (strength <= 15) return 20;
  if (strength <= 17) return 30;
  return 50;
}

export function calculateParryReduction(
  stats: CharacterStats,
  incomingDamage: number,
): number {
  const percentage = getParryReductionPercentage(stats.strength);

  return Math.min(incomingDamage, incomingDamage * (percentage / 100));
}

export function applyParry(
  stats: CharacterStats,
  incomingDamage: number,
): number {
  const reduction = calculateParryReduction(stats, incomingDamage);

  return Math.max(0, incomingDamage - reduction);
}
