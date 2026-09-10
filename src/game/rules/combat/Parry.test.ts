import { describe, expect, it } from "vitest";
import { calculateParryReduction, applyParry } from "./Parry";
import type { CharacterStats } from "../stats/Stats";

describe("Parry", () => {
  it("reduces damage based on strength", () => {
    const stats: CharacterStats = {
      strength: 16,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };

    // STR 16 = 30% Parry reduction
    // 30% of 10 damage = 3 reduction
    expect(calculateParryReduction(stats, 10)).toBe(3);
  });

  it("still provides parry reduction at strength 8", () => {
    const stats: CharacterStats = {
      strength: 8,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };

    // STR 8 = 10% Parry reduction
    expect(calculateParryReduction(stats, 10)).toBe(1);
  });

  it("cannot reduce damage below zero", () => {
    const stats: CharacterStats = {
      strength: 18,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };

    // STR 18 = 50% reduction
    // 50% of 2 = 1, so 1 damage remains.
    expect(applyParry(stats, 2)).toBe(1);
  });

  it("applies the parry reduction correctly", () => {
    const stats: CharacterStats = {
      strength: 16,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };

    // STR 16 = 30% reduction
    // 10 - 3 = 7
    expect(applyParry(stats, 10)).toBe(7);
  });
});
