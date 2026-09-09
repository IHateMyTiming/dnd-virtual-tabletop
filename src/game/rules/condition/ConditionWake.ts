import type { ConditionState } from "./ConditionState";

export function shouldWakeFromDamage(
  conditions: ConditionState[],
  damage: number,
): boolean {
  if (damage <= 0) {
    return false;
  }

  return conditions.some((condition) => condition.id === "sleeping");
}
