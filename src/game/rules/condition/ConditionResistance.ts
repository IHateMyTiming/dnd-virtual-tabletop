import type { ConditionId } from "./Condition";

export type ConditionResistanceType = "constitution" | "charisma";

export function getConditionResistanceType(
  conditionId: ConditionId,
): ConditionResistanceType {
  switch (conditionId) {
    case "frightened":
    case "charmed":
    case "cursed":
    case "sleeping":
    case "petrified":
    case "marked":
    case "pulled":
    case "pushed":
      return "charisma";

    default:
      return "constitution";
  }
}

export const CONDITION_RESISTANCE_CONFIG = {
  abilityModifierPercentage: 5,
  applicationResistanceIncrease: 10,
} as const;
