import { describe, expect, it } from "vitest";
import { applyArmor, rollDamage } from "./Damage";

describe("Damage", () => {
  it("rolls damage within the dice range", () => {
    const result = rollDamage({
      count: 1,
      sides: 8,
    });

    expect(result.rolls).toHaveLength(1);
    expect(result.rolls[0]).toBeGreaterThanOrEqual(1);
    expect(result.rolls[0]).toBeLessThanOrEqual(8);

    expect(result.rawDamage).toBe(result.rolls[0]);
  });
  it("supports damage modifiers", () => {
    const result = rollDamage({
      count: 1,
      sides: 6,
      modifier: 3,
    });

    expect(result.rawDamage).toBe(result.rolls[0] + 3);
  });
  it("supports multiple dice", () => {
    const result = rollDamage({
      count: 2,
      sides: 6,
    });

    expect(result.rolls).toHaveLength(2);

    expect(result.rawDamage).toBe(result.rolls[0] + result.rolls[1]);
  });
  it("reduces damage with armor", () => {
    expect(applyArmor(10, 3)).toBe(7);
  });
  it("cannot reduce damage below zero", () => {
    expect(applyArmor(3, 10)).toBe(0);
  });
  it("scales dice count based on character level", () => {
    const expression = {
      count: 1,
      sides: 10,
      scaling: {
        type: "character-level" as const,
        diceCount: {
          1: 1,
          5: 2,
          9: 3,
          13: 4,
        },
      },
    };

    const level1 = rollDamage(expression, 1);
    expect(level1.rolls).toHaveLength(1);

    const level5 = rollDamage(expression, 5);
    expect(level5.rolls).toHaveLength(2);

    const level9 = rollDamage(expression, 9);
    expect(level9.rolls).toHaveLength(3);

    const level13 = rollDamage(expression, 13);
    expect(level13.rolls).toHaveLength(4);
  });
  it("uses the latest scaling breakpoint below the character level", () => {
    const expression = {
      count: 1,
      sides: 10,
      scaling: {
        type: "character-level" as const,
        diceCount: {
          1: 1,
          5: 2,
          9: 3,
          13: 4,
        },
      },
    };

    const result = rollDamage(expression, 7);

    expect(result.rolls).toHaveLength(2);
  });
  it("scales modifiers based on character level", () => {
    const expression = {
      count: 1,
      sides: 6,
      scaling: {
        type: "character-level" as const,
        modifier: {
          1: 1,
          5: 2,
          9: 3,
        },
      },
    };

    const result = rollDamage(expression, 7);

    expect(result.modifier).toBe(2);
    expect(result.rawDamage).toBe(result.rolls[0] + 2);
  });
});
