import type { CharacterStats } from "../stats/Stats";
import {
  getStrengthModifier,
  getDexterityModifier,
  getConstitutionModifier,
  getWisdomModifier,
  getCharismaModifier,
} from "../stats/Stats";

export interface RangeBand {
  minDistance: number;
  maxDistance: number;
  baseAccuracy: number;
}

export interface CombatStats {
  meleeAccuracy: number;
  rangedAccuracy: number;

  physicalDodge: number;
  spellDodge: number;

  parry: number;

  effectResistance: number;
  mentalResistance: number;
}

export const RANGED_ACCURACY_BANDS: RangeBand[] = [
  {
    minDistance: 0,
    maxDistance: 5,
    baseAccuracy: 95,
  },
  {
    minDistance: 5,
    maxDistance: 10,
    baseAccuracy: 85,
  },
  {
    minDistance: 10,
    maxDistance: 20,
    baseAccuracy: 70,
  },
  {
    minDistance: 20,
    maxDistance: 30,
    baseAccuracy: 55,
  },
  {
    minDistance: 30,
    maxDistance: 40,
    baseAccuracy: 40,
  },
  {
    minDistance: 40,
    maxDistance: 50,
    baseAccuracy: 25,
  },
  {
    minDistance: 50,
    maxDistance: Infinity,
    baseAccuracy: 10,
  },
];

export function getRangeAccuracy(distance: number): number {
  const band = RANGED_ACCURACY_BANDS.find(
    (band) => distance >= band.minDistance && distance < band.maxDistance,
  );

  return band?.baseAccuracy ?? 40;
}

export function getCombatStats(stats: CharacterStats): CombatStats {
  return {
    meleeAccuracy: getMeleeAccuracy(stats),
    rangedAccuracy: getRangedAccuracy(stats),

    physicalDodge: getPhysicalDodge(stats),
    spellDodge: getSpellDodge(stats),

    parry: getParry(stats),

    effectResistance: getEffectResistance(stats),
    mentalResistance: getMentalResistance(stats),
  };
}

function getMeleeAccuracy(stats: CharacterStats): number {
  return clampPercentage(100 + getDexterityModifier(stats) * 5);
}

function getRangedAccuracy(stats: CharacterStats): number {
  return clampPercentage(90 + getDexterityModifier(stats) * 5);
}

function getPhysicalDodge(stats: CharacterStats): number {
  return clampPercentage(10 + getDexterityModifier(stats) * 5);
}

function getSpellDodge(stats: CharacterStats): number {
  return clampPercentage(10 + getWisdomModifier(stats) * 5);
}

function getParry(stats: CharacterStats): number {
  return clampPercentage(10 + getStrengthModifier(stats) * 5);
}

function getEffectResistance(stats: CharacterStats): number {
  return clampPercentage(10 + getConstitutionModifier(stats) * 5);
}

function getMentalResistance(stats: CharacterStats): number {
  return clampPercentage(10 + getCharismaModifier(stats) * 5);
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(99, value));
}
