import { describe, expect, it } from "vitest";
import { getIncomingDamageMultiplier } from "./ConditionDamageModifier";
import { createCondition } from "./ConditionState";

describe("Condition damage modifiers", () => {
  it("returns 1 when there are no conditions", () => {
    expect(getIncomingDamageMultiplier([])).toBe(1);
  });

  it("increases incoming damage based on Marked value", () => {
    const conditions = [createCondition("marked", 2, 1, 25, "enemy-1")];

    expect(getIncomingDamageMultiplier(conditions)).toBe(1.25);
  });

  it("supports different Marked values", () => {
    const conditions = [createCondition("marked", 2, 1, 50, "enemy-1")];

    expect(getIncomingDamageMultiplier(conditions)).toBe(1.5);
  });

  it("ignores unrelated conditions", () => {
    const conditions = [createCondition("stunned", 1)];

    expect(getIncomingDamageMultiplier(conditions)).toBe(1);
  });
});
