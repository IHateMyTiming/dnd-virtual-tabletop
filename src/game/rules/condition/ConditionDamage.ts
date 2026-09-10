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
