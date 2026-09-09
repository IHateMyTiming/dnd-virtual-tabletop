import { rollPercentage } from "../dice/Dice";
import type { ConditionId } from "../condition/Condition";

export interface EffectResistanceState {
  effectId: string;
  resistance: number;
}

export function createEffectResistance(
  effectId: string,
): EffectResistanceState {
  return {
    effectId,
    resistance: 0,
  };
}

export function increaseEffectResistance(
  state: EffectResistanceState,
  amount: number,
): EffectResistanceState {
  return {
    ...state,
    resistance: Math.min(99, state.resistance + amount),
  };
}

export function rollEffectResistance(state: EffectResistanceState): boolean {
  const roll = rollPercentage();
  return roll < state.resistance;
}

export interface ConditionResistanceState {
  conditionId: ConditionId;
  resistance: number;
}

export function createConditionResistance(
  conditionId: ConditionId,
): ConditionResistanceState {
  return {
    conditionId,
    resistance: 0,
  };
}

export function increaseConditionResistance(
  state: ConditionResistanceState,
  amount: number,
): ConditionResistanceState {
  return {
    ...state,
    resistance: Math.min(99, state.resistance + amount),
  };
}

export function rollConditionResistance(
  state: ConditionResistanceState,
  random = Math.random,
): boolean {
  return random() * 100 < state.resistance;
}
