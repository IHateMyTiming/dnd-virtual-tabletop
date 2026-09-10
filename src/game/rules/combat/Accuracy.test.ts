import { describe, expect, it } from "vitest";
import { calculateMeleeAccuracy, calculateRangedAccuracy } from "./Accuracy";
import { createCondition } from "../condition/ConditionState";
import type { CharacterStats } from "../stats/Stats";

const neutralStats: CharacterStats = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

describe("Accuracy", () => {
  it("calculates ranged accuracy", () => {
    const accuracy = calculateRangedAccuracy(neutralStats, 10, "body");

    expect(accuracy).toBe(70);
  });

  it("reduces ranged accuracy when the attacker is blinded", () => {
    const blinded = createCondition("blinded", 2, 1, 50);

    const normalAccuracy = calculateRangedAccuracy(neutralStats, 10, "body");

    const blindedAccuracy = calculateRangedAccuracy(neutralStats, 10, "body", [
      blinded,
    ]);

    expect(blindedAccuracy).toBe(normalAccuracy * 0.5);
  });

  it("reduces defender dodge when the defender is blinded", () => {
    const blinded = createCondition("blinded", 2, 1, 50);

    const normalAccuracy = calculateMeleeAccuracy(
      neutralStats,
      neutralStats,
      "body",
    );

    const blindedAccuracy = calculateMeleeAccuracy(
      neutralStats,
      neutralStats,
      "body",
      [],
      [blinded],
    );

    expect(blindedAccuracy).toBeGreaterThan(normalAccuracy);
  });
});
