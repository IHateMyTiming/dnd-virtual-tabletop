import type { CombatModifier } from "../combat/CombatModifier";

export const MAX_BASE_ABILITY_VALUE = 18;

export type Ability =
  | "strength"
  | "dexterity"
  | "constitution"
  | "intelligence"
  | "wisdom"
  | "charisma";

export interface CharacterStats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export function getAbilityModifier(value: number): number {
  if (value <= 3) return -3;
  if (value <= 5) return -2;
  if (value <= 8) return -1;
  if (value <= 12) return 0;
  if (value <= 15) return 1;
  if (value <= 17) return 2;
  return 3;
}

export function getStrengthModifier(stats: CharacterStats): number {
  return getAbilityModifier(stats.strength);
}

export function getDexterityModifier(stats: CharacterStats): number {
  return getAbilityModifier(stats.dexterity);
}

export function getConstitutionModifier(stats: CharacterStats): number {
  return getAbilityModifier(stats.constitution);
}

export function getIntelligenceModifier(stats: CharacterStats): number {
  return getAbilityModifier(stats.intelligence);
}

export function getWisdomModifier(stats: CharacterStats): number {
  return getAbilityModifier(stats.wisdom);
}

export function getCharismaModifier(stats: CharacterStats): number {
  return getAbilityModifier(stats.charisma);
}

export function getAbilityCheckModifier(
  stats: CharacterStats,
  ability: Ability,
  modifiers: CombatModifier[] = [],
): number {
  return getAbilityModifier(
    getEffectiveAbilityValue(stats, ability, modifiers),
  );
}

export function getEffectiveAbilityValue(
  stats: CharacterStats,
  ability: Ability,
  modifiers: CombatModifier[],
): number {
  let value = stats[ability];

  for (const modifier of modifiers) {
    if (modifier.behavior !== "stat" || modifier.stat !== ability) {
      continue;
    }

    if (modifier.operation === "add") {
      value += modifier.value ?? 0;
    }
  }

  return value;
}

export function isValidBaseAbilityValue(value: number): boolean {
  return value >= 1 && value <= MAX_BASE_ABILITY_VALUE;
}
