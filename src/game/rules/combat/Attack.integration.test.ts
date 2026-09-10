import { describe, expect, it, vi } from "vitest";
import { resolveAttack, rollAttackDamage } from "./Attack";
import type { CharacterStats } from "../stats/Stats";
import { createCondition } from "../condition/ConditionState";

describe("Attack integration", () => {
  it("resolves a successful ranged attack", () => {
    const ranger: CharacterStats = {
      strength: 10,
      dexterity: 16,
      constitution: 13,
      intelligence: 12,
      wisdom: 14,
      charisma: 8,
    };

    const goblin: CharacterStats = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    };

    vi.spyOn(Math, "random").mockReturnValue(0.4);

    const attack = {
      attackerId: "ranger",
      defenderId: "goblin",
      type: "ranged" as const,
      attackerStats: ranger,
      defenderStats: goblin,
      distance: 25,
      target: "body" as const,
      damage: {
        count: 1,
        sides: 8,
      },
      armor: 2,
      magicResistance: 0,
      attackerConditions: [],
      defenderConditions: [],
    };

    const result = resolveAttack(attack);

    expect(result.hit).toBe(true);
    expect(result.chance).toBe(65);

    const damage = rollAttackDamage(attack);

    expect(damage.damage.rawDamage).toBe(4);
    expect(damage.damage.armorReduction).toBe(0);
    expect(damage.damage.magicResistanceReduction).toBe(0);
    expect(damage.damage.finalDamage).toBe(4);

    vi.restoreAllMocks();
  });

  it("resolves a missed ranged attack", () => {
    const ranger: CharacterStats = {
      strength: 10,
      dexterity: 16,
      constitution: 13,
      intelligence: 12,
      wisdom: 14,
      charisma: 8,
    };

    const goblin: CharacterStats = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    };

    vi.spyOn(Math, "random").mockReturnValue(0.9);

    const result = resolveAttack({
      attackerId: "ranger",
      defenderId: "goblin",
      type: "ranged",
      attackerStats: ranger,
      defenderStats: goblin,
      distance: 25,
      target: "body",
      damage: {
        count: 1,
        sides: 8,
      },
      armor: 2,
      magicResistance: 0,
      attackerConditions: [],
      defenderConditions: [],
    });

    expect(result.hit).toBe(false);
    expect(result.chance).toBe(65);

    vi.restoreAllMocks();
  });

  it("resolves a melee attack", () => {
    const fighter: CharacterStats = {
      strength: 16,
      dexterity: 16,
      constitution: 13,
      intelligence: 10,
      wisdom: 10,
      charisma: 8,
    };

    const goblin: CharacterStats = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    };

    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const result = resolveAttack({
      attackerId: "fighter",
      defenderId: "goblin",
      type: "melee",
      attackerStats: fighter,
      defenderStats: goblin,
      distance: 1,
      target: "body",
      damage: {
        count: 1,
        sides: 8,
      },
      armor: 2,
      magicResistance: 0,
      attackerConditions: [],
      defenderConditions: [],
    });

    expect(result.hit).toBe(true);
    expect(result.chance).toBe(100);

    vi.restoreAllMocks();
  });

  it("reduces accuracy when the attacker is frightened", () => {
    const attacker: CharacterStats = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };

    const defender: CharacterStats = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };

    const frightened = createCondition("frightened", 2, 1, 50, "goblin");

    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = resolveAttack({
      attackerStats: attacker,
      defenderStats: defender,
      type: "melee",
      distance: 1,
      target: "body",
      damage: {
        count: 1,
        sides: 10,
      },
      armor: 0,
      magicResistance: 0,
      attackerConditions: [frightened],
      defenderConditions: [],
      attackerId: "ranger",
      defenderId: "goblin",
    });

    expect(result.hit).toBe(true);
    expect(result.chance).toBe(100);

    vi.restoreAllMocks();
  });

  it("resolves a melee attack while the attacker is frightened", () => {
    const attacker: CharacterStats = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };

    const defender: CharacterStats = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };

    const frightened = createCondition("frightened", 2, 1, 50, "goblin");

    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = resolveAttack({
      attackerStats: attacker,
      defenderStats: defender,
      type: "melee",
      distance: 1,
      target: "body",
      damage: {
        count: 1,
        sides: 10,
      },
      armor: 0,
      magicResistance: 0,
      attackerConditions: [frightened],
      defenderConditions: [],
      attackerId: "ranger",
      defenderId: "goblin",
    });

    expect(result.hit).toBe(true);
    expect(result.chance).toBe(100);

    vi.restoreAllMocks();
  });
});
