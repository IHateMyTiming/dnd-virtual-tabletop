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
});
