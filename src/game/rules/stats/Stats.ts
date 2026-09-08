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
