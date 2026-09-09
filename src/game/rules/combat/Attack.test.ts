import { describe, expect, it } from "vitest";
import { resolveAttack } from "./Attack";
import type { CharacterStats } from "../stats/Stats";
import type { ConditionState } from "../condition/ConditionState";

describe("Attack", () => {
  it("calculates ranged attack accuracy correctly", () => {
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
      magicResistance: 0,

      attackerConditions: [],
      defenderConditions: [],
    });

    expect(result.chance).toBe(65);
  });
});
