import { describe, expect, it } from "vitest";
import {
  createEmptyResources,
  hasSpellSlot,
  consumeSpellSlot,
  restoreSpellSlot,
  restoreAllSpellSlots,
  type CharacterResources,
} from "./Resource";

describe("Resource", () => {
  it("creates empty resources", () => {
    const resources = createEmptyResources();

    expect(resources.spellSlots).toEqual({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    });

    expect(resources.maxSpellSlots).toEqual({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    });
  });

  it("detects whether a spell slot is available", () => {
    const resources: CharacterResources = {
      spellSlots: {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
        5: 0,
        6: 0,
      },
      maxSpellSlots: {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
        5: 0,
        6: 0,
      },
    };

    expect(hasSpellSlot(resources, 1)).toBe(true);
    expect(hasSpellSlot(resources, 2, 2)).toBe(true);
    expect(hasSpellSlot(resources, 3)).toBe(true);
    expect(hasSpellSlot(resources, 4)).toBe(false);
  });

  it("consumes a spell slot", () => {
    const resources: CharacterResources = {
      spellSlots: {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
        5: 0,
        6: 0,
      },
      maxSpellSlots: {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
        5: 0,
        6: 0,
      },
    };

    const updated = consumeSpellSlot(resources, 1);

    expect(updated.spellSlots[1]).toBe(2);
  });

  it("consumes multiple spell slots", () => {
    const resources: CharacterResources = {
      spellSlots: {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
        5: 0,
        6: 0,
      },
      maxSpellSlots: {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
        5: 0,
        6: 0,
      },
    };

    const updated = consumeSpellSlot(resources, 1, 2);

    expect(updated.spellSlots[1]).toBe(1);
  });

  it("throws when consuming more spell slots than available", () => {
    const resources: CharacterResources = {
      spellSlots: {
        1: 1,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
      },
      maxSpellSlots: {
        1: 1,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
      },
    };

    expect(() => consumeSpellSlot(resources, 1, 2)).toThrow(
      "Not enough level 1 spell slots.",
    );
  });

  it("restores a spell slot", () => {
    const resources: CharacterResources = {
      spellSlots: {
        1: 1,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
      },
      maxSpellSlots: {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
        5: 0,
        6: 0,
      },
    };

    const updated = restoreSpellSlot(resources, 1);

    expect(updated.spellSlots[1]).toBe(2);
  });

  it("does not restore a spell slot above its maximum", () => {
    const resources: CharacterResources = {
      spellSlots: {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
        5: 0,
        6: 0,
      },
      maxSpellSlots: {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
        5: 0,
        6: 0,
      },
    };

    const updated = restoreSpellSlot(resources, 1);

    expect(updated.spellSlots[1]).toBe(3);
  });

  it("restores all spell slots", () => {
    const resources: CharacterResources = {
      spellSlots: {
        1: 0,
        2: 1,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
      },
      maxSpellSlots: {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
        5: 0,
        6: 0,
      },
    };

    const updated = restoreAllSpellSlots(resources);

    expect(updated.spellSlots).toEqual({
      1: 3,
      2: 2,
      3: 1,
      4: 0,
      5: 0,
      6: 0,
    });
  });

  it("does not mutate the original resources", () => {
    const resources: CharacterResources = {
      spellSlots: {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
        5: 0,
        6: 0,
      },
      maxSpellSlots: {
        1: 3,
        2: 2,
        3: 1,
        4: 0,
        5: 0,
        6: 0,
      },
    };

    const updated = consumeSpellSlot(resources, 1);

    expect(resources.spellSlots[1]).toBe(3);
    expect(updated.spellSlots[1]).toBe(2);
  });
});
