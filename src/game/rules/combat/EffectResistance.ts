import { rollPercentage } from "../dice/Dice";

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
