import type { ConditionState } from "./ConditionState";

export function getEffectiveArmor(
  armor: number,
  conditions: ConditionState[],
): number {
  const armorPenetration = conditions
    .filter((condition) => condition.id === "armor-penetration")
    .reduce(
      (total, condition) => total + (condition.value ?? 0) * condition.stacks,
      0,
    );

  return Math.max(0, armor - armorPenetration);
}
