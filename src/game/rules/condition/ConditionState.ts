import type { ConditionId } from "./Condition";

export interface ConditionState {
  id: ConditionId;
  duration: number;
  stacks: number;
  value?: number;
  sourceId?: string;
}

export function createCondition(
  id: ConditionId,
  duration: number,
  stacks = 1,
  value?: number,
  sourceId?: string,
): ConditionState {
  if (duration < 0) {
    throw new Error("Condition duration cannot be negative.");
  }

  if (!Number.isInteger(duration)) {
    throw new Error("Condition duration must be an integer.");
  }

  if (stacks < 1) {
    throw new Error("Condition stacks must be at least 1.");
  }

  if (!Number.isInteger(stacks)) {
    throw new Error("Condition stacks must be an integer.");
  }

  return {
    id,
    duration,
    stacks,
    value,
    sourceId,
  };
}

export function addConditionStacks(
  condition: ConditionState,
  amount: number,
): ConditionState {
  if (amount < 0) {
    throw new Error("Condition stack increase cannot be negative.");
  }

  return {
    ...condition,
    stacks: condition.stacks + amount,
  };
}

export function reduceConditionDuration(
  condition: ConditionState,
  amount = 1,
): ConditionState {
  if (amount < 0) {
    throw new Error("Condition duration reduction cannot be negative.");
  }

  return {
    ...condition,
    duration: Math.max(0, condition.duration - amount),
  };
}

export function isConditionExpired(condition: ConditionState): boolean {
  return condition.duration <= 0;
}
