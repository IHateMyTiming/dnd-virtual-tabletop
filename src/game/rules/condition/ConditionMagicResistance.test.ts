import { describe, expect, it } from "vitest";
import { createCondition } from "./ConditionState";
import { getEffectiveMagicResistance } from "./ConditionMagicResistance";

describe("ConditionMagicResistance", () => {
  it("reduces magic resistance by the condition value", () => {
    const conditions = [
      createCondition("magic-penetration", 2, 1, 5, "attacker-1"),
    ];

    expect(getEffectiveMagicResistance(20, conditions)).toBe(15);
  });

  it("uses stacks", () => {
    const conditions = [
      createCondition("magic-penetration", 2, 2, 5, "attacker-1"),
    ];

    expect(getEffectiveMagicResistance(20, conditions)).toBe(10);
  });

  it("cannot reduce magic resistance below zero", () => {
    const conditions = [
      createCondition("magic-penetration", 2, 1, 50, "attacker-1"),
    ];

    expect(getEffectiveMagicResistance(20, conditions)).toBe(0);
  });

  it("does nothing without magic penetration", () => {
    expect(getEffectiveMagicResistance(20, [])).toBe(20);
  });
});
