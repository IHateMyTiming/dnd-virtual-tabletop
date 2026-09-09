import type { ConditionState } from "./ConditionState";

export function getEffectiveMagicResistance(
  magicResistance: number,
  conditions: ConditionState[],
): number {
  const magicPenetration = conditions
    .filter((condition) => condition.id === "magic-penetration")
    .reduce(
      (total, condition) => total + (condition.value ?? 0) * condition.stacks,
      0,
    );

  return Math.max(0, magicResistance - magicPenetration);
}
