import { describe, expect, it } from "vitest";

import {
  addConditionStacks,
  createCondition,
  isConditionExpired,
  reduceConditionDuration,
} from "./ConditionState";

import { ConditionManager } from "./ConditionManager";

import {
  canMove,
  canUseAction,
  canUseBonusAction,
  canUseReaction,
  canUseSpells,
  canUseSpecialMovement,
} from "./ConditionRestrictions";

import { getConditionDamage } from "./ConditionDamage";
import { getConditionMovementMultiplier } from "./ConditionMovement";
import { getConditionAccuracyMultiplier } from "./ConditionAccuracy";
import { getConditionDodgeMultiplier } from "./ConditionDefense";

describe("Conditions", () => {
  it("creates a condition", () => {
    const condition = createCondition("stunned", 1);

    expect(condition).toEqual({
      id: "stunned",
      duration: 1,
      stacks: 1,
    });
  });

  it("creates a condition with multiple stacks", () => {
    const condition = createCondition("poisoned", 3, 2);

    expect(condition).toEqual({
      id: "poisoned",
      duration: 3,
      stacks: 2,
    });
  });

  it("rejects negative duration", () => {
    expect(() => createCondition("stunned", -1)).toThrow(
      "Condition duration cannot be negative.",
    );
  });

  it("rejects less than one stack", () => {
    expect(() => createCondition("poisoned", 3, 0)).toThrow(
      "Condition stacks must be at least 1.",
    );
  });

  it("adds stacks", () => {
    const condition = createCondition("poisoned", 3, 2);

    const updated = addConditionStacks(condition, 2);

    expect(updated.stacks).toBe(4);
    expect(updated.duration).toBe(3);
  });

  it("rejects negative stack increase", () => {
    const condition = createCondition("poisoned", 3, 2);

    expect(() => addConditionStacks(condition, -1)).toThrow(
      "Condition stack increase cannot be negative.",
    );
  });

  it("reduces duration", () => {
    const condition = createCondition("stunned", 3);

    const updated = reduceConditionDuration(condition);

    expect(updated.duration).toBe(2);
  });

  it("can reduce duration by multiple turns", () => {
    const condition = createCondition("stunned", 5);

    const updated = reduceConditionDuration(condition, 3);

    expect(updated.duration).toBe(2);
  });

  it("does not allow duration to become negative", () => {
    const condition = createCondition("stunned", 1);

    const updated = reduceConditionDuration(condition, 5);

    expect(updated.duration).toBe(0);
  });

  it("detects expired conditions", () => {
    const condition = createCondition("stunned", 1);

    const expired = reduceConditionDuration(condition);

    expect(isConditionExpired(expired)).toBe(true);
  });

  it("detects active conditions", () => {
    const condition = createCondition("stunned", 2);

    expect(isConditionExpired(condition)).toBe(false);
  });
});

describe("ConditionManager", () => {
  it("applies a condition", () => {
    const manager = new ConditionManager();

    manager.applyCondition("ranger", "stunned", 2);

    expect(manager.hasCondition("ranger", "stunned")).toBe(true);
  });

  it("gets an applied condition", () => {
    const manager = new ConditionManager();

    manager.applyCondition("ranger", "poisoned", 3, 2);

    expect(manager.getCondition("ranger", "poisoned")).toEqual({
      id: "poisoned",
      duration: 3,
      stacks: 2,
    });
  });

  it("returns all conditions on a target", () => {
    const manager = new ConditionManager();

    manager.applyCondition("ranger", "poisoned", 3);
    manager.applyCondition("ranger", "slowed", 2);

    expect(manager.getConditions("ranger")).toHaveLength(2);
  });

  it("adds stacks to an existing condition", () => {
    const manager = new ConditionManager();

    manager.applyCondition("ranger", "poisoned", 3, 2);
    manager.applyCondition("ranger", "poisoned", 2, 1);

    expect(manager.getCondition("ranger", "poisoned")?.stacks).toBe(3);
  });

  it("removes a condition", () => {
    const manager = new ConditionManager();

    manager.applyCondition("ranger", "stunned", 2);

    expect(manager.removeCondition("ranger", "stunned")).toBe(true);
    expect(manager.hasCondition("ranger", "stunned")).toBe(false);
  });

  it("returns false when removing a condition that does not exist", () => {
    const manager = new ConditionManager();

    expect(manager.removeCondition("ranger", "stunned")).toBe(false);
  });

  it("reduces condition duration", () => {
    const manager = new ConditionManager();

    manager.applyCondition("ranger", "stunned", 3);

    manager.reduceDuration("ranger", "stunned");

    expect(manager.getCondition("ranger", "stunned")?.duration).toBe(2);
  });

  it("removes a condition when its duration expires", () => {
    const manager = new ConditionManager();

    manager.applyCondition("ranger", "stunned", 1);

    manager.reduceDuration("ranger", "stunned");

    expect(manager.hasCondition("ranger", "stunned")).toBe(false);
  });

  it("clears all conditions from a target", () => {
    const manager = new ConditionManager();

    manager.applyCondition("ranger", "poisoned", 3);
    manager.applyCondition("ranger", "burning", 2);

    manager.clearConditions("ranger");

    expect(manager.getConditions("ranger")).toHaveLength(0);
  });
  it("caps condition stacks at the maximum", () => {
    const manager = new ConditionManager();

    manager.applyCondition("goblin", "poisoned", 3, 4);
    manager.applyCondition("goblin", "poisoned", 3, 3);

    expect(manager.getCondition("goblin", "poisoned")?.stacks).toBe(5);
  });

  it("adds only the remaining stacks when close to the cap", () => {
    const manager = new ConditionManager();

    manager.applyCondition("goblin", "poisoned", 3, 4);
    manager.applyCondition("goblin", "poisoned", 3, 1);

    expect(manager.getCondition("goblin", "poisoned")?.stacks).toBe(5);
  });

  it("refreshes duration when a condition is reapplied", () => {
    const manager = new ConditionManager();

    manager.applyCondition("goblin", "poisoned", 2, 1);
    manager.reduceDuration("goblin", "poisoned");

    manager.applyCondition("goblin", "poisoned", 5, 1);

    expect(manager.getCondition("goblin", "poisoned")?.duration).toBe(5);
  });

  it("does not exceed one stack for single-stack conditions", () => {
    const manager = new ConditionManager();

    manager.applyCondition("goblin", "stunned", 2);
    manager.applyCondition("goblin", "stunned", 2, 5);

    expect(manager.getCondition("goblin", "stunned")?.stacks).toBe(1);
  });
});

describe("Condition Restrictions", () => {
  it("stunned prevents everything", () => {
    const conditions = [createCondition("stunned", 2)];

    expect(canMove(conditions)).toBe(false);
    expect(canUseAction(conditions)).toBe(false);
    expect(canUseBonusAction(conditions)).toBe(false);
    expect(canUseReaction(conditions)).toBe(false);
    expect(canUseSpells(conditions)).toBe(false);
    expect(canUseSpecialMovement(conditions)).toBe(false);
  });

  it("rooted prevents movement", () => {
    const conditions = [createCondition("rooted", 2)];

    expect(canMove(conditions)).toBe(false);
    expect(canUseSpecialMovement(conditions)).toBe(false);
    expect(canUseAction(conditions)).toBe(true);
  });

  it("freezed allows walking but prevents special movement and bonus action", () => {
    const conditions = [createCondition("freezed", 2)];

    expect(canMove(conditions)).toBe(true);
    expect(canUseSpecialMovement(conditions)).toBe(false);
    expect(canUseBonusAction(conditions)).toBe(false);
    expect(canUseAction(conditions)).toBe(true);
  });

  it("suppressed prevents movement and spells", () => {
    const conditions = [createCondition("suppressed", 2)];

    expect(canMove(conditions)).toBe(false);
    expect(canUseSpecialMovement(conditions)).toBe(false);
    expect(canUseSpells(conditions)).toBe(false);
    expect(canUseAction(conditions)).toBe(true);
  });

  it("silenced prevents spells but allows movement", () => {
    const conditions = [createCondition("silenced", 2)];

    expect(canMove(conditions)).toBe(true);
    expect(canUseSpells(conditions)).toBe(false);
  });
  it("reduces all condition durations at round start", () => {
    const manager = new ConditionManager();

    manager.applyCondition("ranger", "poisoned", 3);
    manager.applyCondition("ranger", "burning", 2);

    manager.processRoundStart();

    expect(manager.getCondition("ranger", "poisoned")?.duration).toBe(2);

    expect(manager.getCondition("ranger", "burning")?.duration).toBe(1);
  });
  it("removes conditions that expire at round start", () => {
    const manager = new ConditionManager();

    manager.applyCondition("ranger", "stunned", 1);
    manager.applyCondition("ranger", "poisoned", 2);

    manager.processRoundStart();

    expect(manager.hasCondition("ranger", "stunned")).toBe(false);

    expect(manager.getCondition("ranger", "poisoned")?.duration).toBe(1);
  });
});

describe("Condition Damage", () => {
  it("calculates poisoned damage from stacks", () => {
    const condition = createCondition("poisoned", 3, 3);

    const damage = getConditionDamage(condition);

    expect(damage).toEqual({
      conditionId: "poisoned",
      damagePerStack: 1,
      totalDamage: 3,
    });
  });

  it("calculates burning damage from stacks", () => {
    const condition = createCondition("burning", 3, 2);

    const damage = getConditionDamage(condition);

    expect(damage?.totalDamage).toBe(2);
  });

  it("calculates acid damage from stacks", () => {
    const condition = createCondition("acid", 3, 4);

    const damage = getConditionDamage(condition);

    expect(damage?.totalDamage).toBe(4);
  });

  it("calculates bleeding damage from stacks", () => {
    const condition = createCondition("bleeding", 3, 5);

    const damage = getConditionDamage(condition);

    expect(damage?.totalDamage).toBe(5);
  });

  it("returns undefined for conditions that do not deal damage", () => {
    const condition = createCondition("stunned", 2);

    expect(getConditionDamage(condition)).toBeUndefined();
  });
});

describe("Condition Movement", () => {
  it("does not modify movement without movement conditions", () => {
    const conditions = [createCondition("stunned", 2)];

    expect(getConditionMovementMultiplier(conditions)).toBe(1);
  });

  it("slowed reduces movement", () => {
    const conditions = [createCondition("slowed", 2)];

    expect(getConditionMovementMultiplier(conditions)).toBe(0.5);
  });

  it("freezed reduces movement", () => {
    const conditions = [createCondition("freezed", 2)];

    expect(getConditionMovementMultiplier(conditions)).toBe(0.5);
  });

  it("multiple movement modifiers multiply together", () => {
    const conditions = [
      createCondition("slowed", 2),
      createCondition("freezed", 2),
    ];

    expect(getConditionMovementMultiplier(conditions)).toBe(0.25);
  });
});

describe("Condition Accuracy", () => {
  it("blinded reduces ranged accuracy", () => {
    const conditions = [createCondition("blinded", 2)];

    expect(getConditionAccuracyMultiplier(conditions, "ranged")).toBe(0.5);
  });

  it("blinded does not directly reduce melee accuracy", () => {
    const conditions = [createCondition("blinded", 2)];

    expect(getConditionAccuracyMultiplier(conditions, "melee")).toBe(1);
  });

  it("conditions without accuracy effects do not modify accuracy", () => {
    const conditions = [createCondition("poisoned", 2)];

    expect(getConditionAccuracyMultiplier(conditions, "ranged")).toBe(1);
  });
});

describe("Condition Defense", () => {
  it("blinded increases the defender dodge multiplier", () => {
    const conditions = [createCondition("blinded", 2)];

    expect(getConditionDodgeMultiplier(conditions)).toBe(2);
  });

  it("conditions without dodge effects do not modify dodge", () => {
    const conditions = [createCondition("poisoned", 2)];

    expect(getConditionDodgeMultiplier(conditions)).toBe(1);
  });
});
