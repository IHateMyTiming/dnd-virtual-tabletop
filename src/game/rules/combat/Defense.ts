import type { CharacterStats } from "../stats/Stats";

import { getStrengthModifier } from "../stats/Stats";

export type DefenseChoice = "dodge" | "parry";

export interface DefenseStats {
  physicalDodge: number;
  spellDodge: number;
  parry: number;
  effectResistance: number;
  mentalResistance: number;
}

export function getDefenseStats(stats: CharacterStats): DefenseStats {
  return {
    physicalDodge: getPhysicalDodge(stats),
    spellDodge: getSpellDodge(stats),
    parry: getParry(stats),
    effectResistance: getEffectResistance(stats),
    mentalResistance: getMentalResistance(stats),
  };
}

function getPhysicalDodge(stats: CharacterStats): number {
  return getPassiveDefense(stats.dexterity);
}

function getSpellDodge(stats: CharacterStats): number {
  return getPassiveDefense(stats.wisdom);
}

function getEffectResistance(stats: CharacterStats): number {
  return getPassiveDefense(stats.constitution);
}

function getMentalResistance(stats: CharacterStats): number {
  return getPassiveDefense(stats.charisma);
}

function getPassiveDefense(value: number): number {
  if (value <= 8) return 10;
  if (value <= 12) return 15;
  if (value <= 15) return 20;
  if (value <= 17) return 25;
  return 50;
}

function getParry(stats: CharacterStats): number {
  return clampPercentage(10 + getStrengthModifier(stats) * 5);
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(99, value));
}
