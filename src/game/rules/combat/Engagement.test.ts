import { describe, expect, it } from "vitest";
import { didLeaveMeleeRange, isInMeleeRange } from "./Engagement";

describe("Engagement", () => {
  it("detects when combatants are in melee range", () => {
    expect(isInMeleeRange({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(true);
  });

  it("detects when combatants are outside melee range", () => {
    expect(isInMeleeRange({ x: 0, y: 0 }, { x: 2, y: 0 })).toBe(false);
  });

  it("detects when walking leaves melee range", () => {
    expect(
      didLeaveMeleeRange({ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 1, y: 0 }),
    ).toBe(true);
  });

  it("does not trigger when remaining in melee range", () => {
    expect(
      didLeaveMeleeRange({ x: 0, y: 0 }, { x: 0.5, y: 0 }, { x: 1, y: 0 }),
    ).toBe(false);
  });

  it("does not trigger when starting outside melee range", () => {
    expect(
      didLeaveMeleeRange({ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }),
    ).toBe(false);
  });
});
