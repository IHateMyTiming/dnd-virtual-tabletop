import { rollDice } from "../dice/Dice";
import type { CharacterStats } from "../stats/Stats";
import { calculateParryReduction } from "./Parry";
import type { ConditionState } from "../condition/ConditionState";
import { getIncomingDamageMultiplier } from "../condition/ConditionDamageModifier";
import { getEffectiveArmor } from "../condition/ConditionArmor";
import { getEffectiveMagicResistance } from "../condition/ConditionMagicResistance";

export type DamageType = "physical" | "magic";
export interface DamageExpression {
  count: number;
  sides: number;
  modifier?: number;
  type?: DamageType;
}

export interface DamageResult {
  rolls: number[];
  modifier: number;
  rawDamage: number;
  armorReduction: number;
  parryReduction: number;
  finalDamage: number;
}

export function rollDamage(expression: DamageExpression): DamageResult {
  const result = rollDice(
    expression.count,
    expression.sides,
    expression.modifier ?? 0,
  );

  return {
    rolls: result.rolls,
    modifier: result.modifier,
    rawDamage: result.total,
    armorReduction: 0,
    parryReduction: 0,
    finalDamage: result.total,
  };
}

export function applyArmor(damage: number, armor: number): number {
  const reduction = Math.max(0, armor);

  return Math.max(0, damage - reduction);
}

export function resolveDamage(
  expression: DamageExpression,
  armor: number,
  magicResistance: number,
  defenderStats: CharacterStats,
  defenderConditions: ConditionState[] = [],
): DamageResult {
  const rolled = rollDamage(expression);

  const damageType = expression.type ?? "physical";

  let armorReduction = 0;
  let afterDefense = rolled.rawDamage;

  if (damageType === "physical") {
    const effectiveArmor = getEffectiveArmor(armor, defenderConditions);

    armorReduction = Math.max(0, effectiveArmor);
    afterDefense = Math.max(0, rolled.rawDamage - armorReduction);
  } else {
    const effectiveMagicResistance = getEffectiveMagicResistance(
      magicResistance,
      defenderConditions,
    );

    const magicResistanceReduction = Math.max(0, effectiveMagicResistance);

    afterDefense = Math.max(0, rolled.rawDamage - magicResistanceReduction);
  }

  const parryReduction =
    damageType === "physical"
      ? calculateParryReduction(defenderStats, afterDefense)
      : 0;

  const afterParry = Math.max(0, afterDefense - parryReduction);

  const damageMultiplier = getIncomingDamageMultiplier(defenderConditions);

  const finalDamage = afterParry * damageMultiplier;

  return {
    ...rolled,
    armorReduction,
    parryReduction,
    finalDamage,
  };
}

export function rollCombinedDamage(expressions: DamageExpression[]): number {
  return expressions.reduce(
    (total, expression) => total + rollDamage(expression).rawDamage,
    0,
  );
}
