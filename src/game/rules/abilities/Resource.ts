export type SpellSlotLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const SPELL_SLOT_LEVELS: SpellSlotLevel[] = [1, 2, 3, 4, 5, 6];

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

export function findAvailableSpellSlot(
  resources: CharacterResources,
  minimumLevel: SpellSlotLevel,
): SpellSlotLevel | null {
  for (const level of SPELL_SLOT_LEVELS) {
    if (level < minimumLevel) {
      continue;
    }

    if (resources.spellSlots[level] > 0) {
      return level;
    }
  }

  return null;
}

export function hasSpellSlot(
  resources: CharacterResources,
  minimumLevel: SpellSlotLevel,
  amount = 1,
): boolean {
  if (amount <= 0) {
    return true;
  }

  let availableSlots = 0;

  for (const level of SPELL_SLOT_LEVELS) {
    if (level < minimumLevel) {
      continue;
    }

    availableSlots += resources.spellSlots[level];

    if (availableSlots >= amount) {
      return true;
    }
  }

  return false;
}

export function consumeSpellSlot(
  resources: CharacterResources,
  minimumLevel: SpellSlotLevel,
  amount = 1,
): CharacterResources {
  if (amount <= 0) {
    return { ...resources };
  }

  if (!hasSpellSlot(resources, minimumLevel, amount)) {
    throw new Error(
      `Not enough spell slots of level ${minimumLevel} or higher.`,
    );
  }

  let remaining = amount;

  const updatedSpellSlots = {
    ...resources.spellSlots,
  };

  for (const level of SPELL_SLOT_LEVELS) {
    if (level < minimumLevel) {
      continue;
    }

    const available = updatedSpellSlots[level];

    if (available <= 0) {
      continue;
    }

    const consumed = Math.min(available, remaining);

    updatedSpellSlots[level] -= consumed;
    remaining -= consumed;

    if (remaining === 0) {
      break;
    }
  }

  return {
    ...resources,
    spellSlots: updatedSpellSlots,
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
