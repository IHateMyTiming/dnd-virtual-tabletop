import { describe, expect, it, vi } from "vitest";
import { resolveAttack } from "./Attack";
import type { CharacterStats } from "../stats/Stats";

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

    const result = resolveAttack({
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
    });

    expect(result.hit).toBe(true);
    expect(result.chance).toBe(65);

    expect(result.damage?.rawDamage).toBe(4);
    expect(result.damage?.armorReduction).toBe(2);
    expect(result.damage?.parryReduction).toBe(0);
    expect(result.damage?.finalDamage).toBe(2);

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

    // 90 is higher than the 65% chance to hit.
    vi.spyOn(Math, "random").mockReturnValue(0.9);

    const result = resolveAttack({
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
    });

    expect(result.hit).toBe(false);
    expect(result.chance).toBe(65);
    expect(result.damage).toBeUndefined();

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

    // Melee body:
    // Attacker accuracy = 110%
    // Target accuracy = 100%
    // Goblin dodge = 10%
    // Final = 99% after clamping.
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const result = resolveAttack({
      type: "melee",
      attackerStats: fighter,
      defenderStats: goblin,
      distance: 1,
      target: "body",
      damage: {
        count: 1,
        sides: 10,
      },
      armor: 2,
    });

    expect(result.hit).toBe(true);
    expect(result.chance).toBe(90);
    vi.restoreAllMocks();
  });
});
