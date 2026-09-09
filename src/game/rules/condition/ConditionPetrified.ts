import type { ConditionState } from "./ConditionState";

export function getPetrifiedDamageMultiplier(
  conditions: ConditionState[],
): number {
  const petrified = conditions.find(
    (condition) => condition.id === "petrified",
  );

  if (!petrified) {
    return 1;
  }

  const damagePercent = petrified.value ?? 100;

  return damagePercent / 100;
}
