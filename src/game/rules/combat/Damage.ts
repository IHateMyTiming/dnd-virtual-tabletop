import { rollDice } from "../dice/Dice";
import type { CharacterStats } from "../stats/Stats";
import { applyParry } from "./Parry";

export interface DamageExpression {
  count: number;
  sides: number;
  modifier?: number;
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
  defenderStats: CharacterStats,
): DamageResult {
  const rolled = rollDamage(expression);

  const afterArmor = applyArmor(rolled.rawDamage, armor);

  const afterParry = applyParry(defenderStats, afterArmor);

  const armorReduction = rolled.rawDamage - afterArmor;

  const parryReduction = afterArmor - afterParry;

  return {
    ...rolled,
    armorReduction,
    parryReduction,
    finalDamage: afterParry,
  };
}

export function rollCombinedDamage(expressions: DamageExpression[]): number {
  return expressions.reduce(
    (total, expression) => total + rollDamage(expression).rawDamage,
    0,
  );
}
