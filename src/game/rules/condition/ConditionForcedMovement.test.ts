import { describe, expect, it } from "vitest";
import { createCondition } from "./ConditionState";
import { calculateForcedMovement } from "./ConditionForcedMovement";

describe("ConditionForcedMovement", () => {
  it("pulls the target toward the source", () => {
    const condition = createCondition("pulled", 1, 1, 3, "source-1");

    const result = calculateForcedMovement(
      { x: 10, y: 0 },
      { x: 0, y: 0 },
      condition,
    );

    expect(result).toEqual({
      x: 7,
      y: 0,
    });
  });

  it("pushes the target away from the source", () => {
    const condition = createCondition("pushed", 1, 1, 3, "source-1");

    const result = calculateForcedMovement(
      { x: 10, y: 0 },
      { x: 0, y: 0 },
      condition,
    );

    expect(result).toEqual({
      x: 13,
      y: 0,
    });
  });

  it("works diagonally", () => {
    const condition = createCondition("pulled", 1, 1, 5, "source-1");

    const result = calculateForcedMovement(
      { x: 10, y: 10 },
      { x: 0, y: 0 },
      condition,
    );

    expect(result.x).toBeCloseTo(10 - 5 / Math.sqrt(2));
    expect(result.y).toBeCloseTo(10 - 5 / Math.sqrt(2));
  });

  it("does not move when the condition has no value", () => {
    const condition = createCondition("pulled", 1, 1, undefined, "source-1");

    const position = { x: 10, y: 10 };

    expect(
      calculateForcedMovement(position, { x: 0, y: 0 }, condition),
    ).toEqual(position);
  });

  it("does not move when source and target overlap", () => {
    const condition = createCondition("pushed", 1, 1, 5, "source-1");

    const position = { x: 10, y: 10 };

    expect(calculateForcedMovement(position, position, condition)).toEqual(
      position,
    );
  });
});
