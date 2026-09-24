import type { ConditionId } from "./Condition";
import type { ConditionState } from "./ConditionState";

export interface ConditionDamage {
  conditionId: ConditionId;
  damagePerStack: number;
  totalDamage: number;
}

export function getConditionDamage(
  condition: ConditionState,
): ConditionDamage | undefined {
  if (
    condition.id !== "poisoned" &&
    condition.id !== "burning" &&
    condition.id !== "acid" &&
    condition.id !== "bleeding"
  ) {
    return undefined;
  }

  const damagePerStack = condition.value ?? 0;

  return {
    conditionId: condition.id,
    damagePerStack,
    totalDamage: damagePerStack * condition.stacks,
  };
}

export function getConsumedConditionDamage(
  conditions: ConditionState[],
  conditionIds: ConditionId[],
): number {
  let totalDamage = 0;

  for (const conditionId of conditionIds) {
    const condition = conditions.find(
      (currentCondition) => currentCondition.id === conditionId,
    );

    if (!condition) {
      continue;
    }

    const damage = getConditionDamage(condition);

    if (!damage) {
      continue;
    }

    totalDamage += damage.totalDamage;
  }

  return totalDamage;
}
