import { describe, expect, it } from "vitest";
import {
  classifyAttackRoll,
  getAttackAdvantageState,
  resolveAdvantage,
} from "./Advantage";

import type { ConditionState } from "../condition/ConditionState";

describe("classifyAttackRoll", () => {
  it("classifies a roll below the crit threshold as critical", () => {
    expect(classifyAttackRoll(6, 80, 8)).toBe("critical");
  });
  it("classifies a roll equal to the crit threshold as critical", () => {
    expect(classifyAttackRoll(8, 80, 8)).toBe("critical");
  });
  it("classifies a roll inside precision as a normal hit", () => {
    expect(classifyAttackRoll(40, 80, 8)).toBe("hit");
  });
  it("classifies a roll above precision as a miss", () => {
    expect(classifyAttackRoll(81, 80, 8)).toBe("miss");
  });
});

describe("resolveAdvantage", () => {
  it("uses one roll normally", () => {
    let calls = 0;

    const result = resolveAdvantage("normal", 80, 8, () => {
      calls++;
      return 40;
    });

    expect(calls).toBe(1);
    expect(result.rolls).toEqual([40]);
    expect(result.selectedRoll).toBe(40);
    expect(result.selectedOutcome).toBe("hit");
  });
  it("uses two rolls with advantage", () => {
    let calls = 0;

    const result = resolveAdvantage("advantage", 80, 8, () => {
      calls++;

      return calls === 1 ? 70 : 45;
    });

    expect(calls).toBe(2);
    expect(result.rolls).toEqual([70, 45]);
    expect(result.selectedRoll).toBe(70);
    expect(result.selectedOutcome).toBe("hit");
  });
  it("chooses a critical over a normal hit with advantage", () => {
    let calls = 0;

    const result = resolveAdvantage("advantage", 80, 8, () => {
      calls++;

      return calls === 1 ? 8 : 58;
    });

    expect(result.rolls).toEqual([8, 58]);
    expect(result.selectedRoll).toBe(8);
    expect(result.selectedOutcome).toBe("critical");
  });
  it("chooses a hit over a miss with advantage", () => {
    let calls = 0;

    const result = resolveAdvantage("advantage", 50, 5, () => {
      calls++;

      return calls === 1 ? 70 : 45;
    });

    expect(result.rolls).toEqual([70, 45]);
    expect(result.selectedRoll).toBe(45);
    expect(result.selectedOutcome).toBe("hit");
  });
  it("chooses a normal hit over a critical with disadvantage", () => {
    let calls = 0;

    const result = resolveAdvantage("disadvantage", 100, 10, () => {
      calls++;

      return calls === 1 ? 10 : 15;
    });

    expect(result.rolls).toEqual([10, 15]);
    expect(result.selectedRoll).toBe(15);
    expect(result.selectedOutcome).toBe("hit");
  });
  it("chooses a miss over a hit with disadvantage", () => {
    let calls = 0;

    const result = resolveAdvantage("disadvantage", 50, 5, () => {
      calls++;

      return calls === 1 ? 70 : 45;
    });

    expect(result.rolls).toEqual([70, 45]);
    expect(result.selectedRoll).toBe(70);
    expect(result.selectedOutcome).toBe("miss");
  });
  it("chooses a miss over a critical with disadvantage", () => {
    let calls = 0;

    const result = resolveAdvantage("disadvantage", 100, 10, () => {
      calls++;

      return calls === 1 ? 10 : 101;
    });

    expect(result.rolls).toEqual([10, 101]);
    expect(result.selectedRoll).toBe(101);
    expect(result.selectedOutcome).toBe("miss");
  });
  it("uses the first result when both outcomes are equal", () => {
    let calls = 0;

    const result = resolveAdvantage("advantage", 80, 8, () => {
      calls++;
      return 30;
    });

    expect(result.rolls).toEqual([30, 30]);
    expect(result.selectedRoll).toBe(30);
    expect(result.selectedOutcome).toBe("hit");
  });
});

describe("getAttackAdvantageState", () => {
  it("returns normal when neither combatant has relevant conditions", () => {
    const result = getAttackAdvantageState([], []);

    expect(result).toBe("normal");
  });
  it("returns disadvantage when the attacker has a condition that causes disadvantage", () => {
    const attackerConditions: ConditionState[] = [
      {
        id: "stunned",
        stacks: 1,
        duration: 1,
      },
    ];

    const result = getAttackAdvantageState(attackerConditions, []);

    expect(result).toBe("disadvantage");
  });
  it("returns advantage when the defender has a condition that grants advantage when targeted", () => {
    const defenderConditions: ConditionState[] = [
      {
        id: "stunned",
        stacks: 1,
        duration: 1,
      },
    ];

    const result = getAttackAdvantageState([], defenderConditions);

    expect(result).toBe("advantage");
  });
  it("returns normal when advantage and disadvantage cancel each other", () => {
    const attackerConditions: ConditionState[] = [
      {
        id: "stunned",
        stacks: 1,
        duration: 1,
      },
    ];

    const defenderConditions: ConditionState[] = [
      {
        id: "stunned",
        stacks: 1,
        duration: 1,
      },
    ];

    const result = getAttackAdvantageState(
      attackerConditions,
      defenderConditions,
    );

    expect(result).toBe("normal");
  });
  it("ignores conditions that do not affect advantage or disadvantage", () => {
    const attackerConditions: ConditionState[] = [
      {
        id: "poisoned",
        stacks: 1,
        duration: 1,
      },
    ];

    const defenderConditions: ConditionState[] = [
      {
        id: "poisoned",
        stacks: 1,
        duration: 1,
      },
    ];

    const result = getAttackAdvantageState(
      attackerConditions,
      defenderConditions,
    );

    expect(result).toBe("normal");
  });
});
