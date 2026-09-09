import { describe, expect, it } from "vitest";
import { createCondition } from "./ConditionState";
import { getEffectiveArmor } from "./ConditionArmor";

describe("ConditionArmor", () => {
  it("reduces armor by the condition value", () => {
    const conditions = [
      createCondition("armor-penetration", 2, 1, 5, "attacker-1"),
    ];

    expect(getEffectiveArmor(20, conditions)).toBe(15);
  });

  it("uses stacks", () => {
    const conditions = [
      createCondition("armor-penetration", 2, 2, 5, "attacker-1"),
    ];

    expect(getEffectiveArmor(20, conditions)).toBe(10);
  });

  it("cannot reduce armor below zero", () => {
    const conditions = [
      createCondition("armor-penetration", 2, 1, 50, "attacker-1"),
    ];

    expect(getEffectiveArmor(20, conditions)).toBe(0);
  });

  it("does nothing when there is no armor penetration", () => {
    expect(getEffectiveArmor(20, [])).toBe(20);
  });
});
