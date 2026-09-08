export type SpellSlotLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface CharacterResources {
  spellSlots: Record<SpellSlotLevel, number>;
  maxSpellSlots: Record<SpellSlotLevel, number>;
}

export function createEmptyResources(): CharacterResources {
  return {
    spellSlots: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    },
    maxSpellSlots: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    },
  };
}

export function hasSpellSlot(
  resources: CharacterResources,
  level: SpellSlotLevel,
  amount = 1,
): boolean {
  return resources.spellSlots[level] >= amount;
}

export function consumeSpellSlot(
  resources: CharacterResources,
  level: SpellSlotLevel,
  amount = 1,
): CharacterResources {
  if (!hasSpellSlot(resources, level, amount)) {
    throw new Error(`Not enough level ${level} spell slots.`);
  }

  return {
    ...resources,
    spellSlots: {
      ...resources.spellSlots,
      [level]: resources.spellSlots[level] - amount,
    },
  };
}

export function restoreSpellSlot(
  resources: CharacterResources,
  level: SpellSlotLevel,
  amount = 1,
): CharacterResources {
  return {
    ...resources,
    spellSlots: {
      ...resources.spellSlots,
      [level]: Math.min(
        resources.spellSlots[level] + amount,
        resources.maxSpellSlots[level],
      ),
    },
  };
}

export function restoreAllSpellSlots(
  resources: CharacterResources,
): CharacterResources {
  return {
    ...resources,
    spellSlots: {
      ...resources.maxSpellSlots,
    },
  };
}
