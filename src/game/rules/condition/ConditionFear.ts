import type { ConditionState } from "./ConditionState";

export function getFrightenedDamageMultiplier(
  attackerConditions: ConditionState[],
  targetId: string,
): number {
  const frightened = attackerConditions.find(
    (condition) =>
      condition.id === "frightened" && condition.sourceId === targetId,
  );

  if (!frightened) {
    return 1;
  }

  const damagePercent = frightened.value ?? 100;

  return damagePercent / 100;
}
