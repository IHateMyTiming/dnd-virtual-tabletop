import type { Ability, CharacterStats } from "../stats/Stats";
import { getAbilityCheckModifier } from "../stats/Stats";

export interface AbilityCheckResult {
  success: boolean;
  roll: number;
  modifier: number;
  total: number;
  dc: number;
}

export function resolveAbilityCheck(
  stats: CharacterStats,
  ability: Ability,
  dc: number,
  random: () => number = Math.random,
): AbilityCheckResult {
  const modifier = getAbilityCheckModifier(stats, ability);

  const roll = Math.floor(random() * 20) + 1;
  const total = roll + modifier;

  return {
    success: total >= dc,
    roll,
    modifier,
    total,
    dc,
  };
}
