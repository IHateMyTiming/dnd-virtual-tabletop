import type { Combatant } from "./Combatant";
import { getModifierValue } from "./CombatModifier";

export function getBaseConcentrationChance(constitution: number): number {
  if (constitution <= 8) return 30;
  if (constitution <= 9) return 35;
  if (constitution <= 10) return 40;
  if (constitution <= 11) return 45;
  if (constitution <= 12) return 50;
  if (constitution <= 14) return 55;
  if (constitution <= 16) return 60;
  if (constitution === 17) return 65;

  return 70;
}

export function getConcentrationChance(combatant: Combatant): number {
  const baseChance = getBaseConcentrationChance(combatant.stats.constitution);

  const externalBonus = getModifierValue(
    combatant.modifiers,
    "concentration",
    "add",
    "concentration",
  );

  const cappedExternalBonus = Math.min(20, externalBonus);

  return Math.min(90, Math.max(0, baseChance + cappedExternalBonus));
}

export interface ConcentrationCheckResult {
  success: boolean;
  chance: number;
  roll: number;
}

export function resolveConcentrationCheck(
  combatant: Combatant,
  random: () => number = Math.random,
): ConcentrationCheckResult {
  const chance = getConcentrationChance(combatant);
  const roll = random() * 100;

  return {
    success: roll < chance,
    chance,
    roll,
  };
}

export function startConcentration(
  combatant: Combatant,
  abilityId: string,
  instanceId?: string,
  remainingDuration?: number,
): void {
  combatant.concentration = {
    abilityId,
    instanceId,
    remainingDuration,
  };
}

export function endConcentration(combatant: Combatant): void {
  combatant.concentration = undefined;
}
