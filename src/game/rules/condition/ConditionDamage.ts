import type { ConditionId } from "./Condition";
import type { ConditionState } from "./ConditionState";

export interface ConditionDamage {
  conditionId: ConditionId;
  damagePerStack: number;
  totalDamage: number;
}

const CONDITION_DAMAGE_PER_STACK: Partial<Record<ConditionId, number>> = {
  poisoned: 1,
  burning: 1,
  acid: 1,
  bleeding: 1,
};

export function getConditionDamage(
  condition: ConditionState,
): ConditionDamage | undefined {
  const damagePerStack = CONDITION_DAMAGE_PER_STACK[condition.id];

  if (damagePerStack === undefined) {
    return undefined;
  }

  return {
    conditionId: condition.id,
    damagePerStack,
    totalDamage: damagePerStack * condition.stacks,
  };
}
