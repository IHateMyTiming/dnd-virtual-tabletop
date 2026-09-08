import { describe, expect, it } from "vitest";
import { calculateParryReduction, applyParry } from "./Parry";
import type { CharacterStats } from "../stats/Stats";

describe("Parry", () => {
  it("reduces damage based on strength modifier", () => {
    const stats: CharacterStats = {
      strength: 16,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };

    // STR 16 = +2 modifier
    // +2 modifier × 2 = 4 reduction
    expect(calculateParryReduction(stats, 10)).toBe(4);
  });

  it("does not reduce damage when strength modifier is negative", () => {
    const stats: CharacterStats = {
      strength: 8,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    };

    expect(calculateParryReduction(stats, 10)).toBe(0);
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

    expect(applyParry(stats, 2)).toBe(0);
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

    expect(applyParry(stats, 10)).toBe(6);
  });
});
