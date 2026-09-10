import type { CharacterStats } from "../stats/Stats";
import { getConstitutionModifier, getCharismaModifier } from "../stats/Stats";

import type { ConditionId } from "./Condition";

import {
  getConditionResistanceType,
  CONDITION_RESISTANCE_CONFIG,
} from "./ConditionResistance";

import type { ConditionResistanceState } from "../combat/EffectResistance";

export function getBaseConditionResistance(
  stats: CharacterStats,
  conditionId: ConditionId,
): number {
  const resistanceType = getConditionResistanceType(conditionId);

  const modifier =
    resistanceType === "charisma"
      ? getCharismaModifier(stats)
      : getConstitutionModifier(stats);

  return modifier * CONDITION_RESISTANCE_CONFIG.abilityModifierPercentage;
}

export function getTotalConditionResistance(
  stats: CharacterStats,
  conditionId: ConditionId,
  state: ConditionResistanceState,
): number {
  return clampPercentage(
    getBaseConditionResistance(stats, conditionId) + state.resistance,
  );
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(99, value));
}
