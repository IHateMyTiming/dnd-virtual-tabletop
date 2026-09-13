import { rollDice } from "../dice/Dice";
import type { CharacterStats } from "../stats/Stats";
import type { ConditionState } from "../condition/ConditionState";
import { getIncomingDamageMultiplier } from "../condition/ConditionDamageModifier";
import { getEffectiveArmor } from "../condition/ConditionArmor";
import { getEffectiveMagicResistance } from "../condition/ConditionMagicResistance";
import type { ConditionId } from "../condition/Condition";

export type DamageType = "physical" | "magic";

export interface DiceScaling {
  type: "character-level";

  diceCount?: Record<number, number>;

  modifier?: Record<number, number>;
}

export interface DamageCondition {
  type: "target-has-condition";
  conditionId?: ConditionId;
  multiplier: number;
}
export interface DamageExpression {
  count: number;
  sides: number;
  modifier?: number;
  type?: DamageType;
  scaling?: DiceScaling;
  conditions?: DamageCondition[];
}
export interface DamageResult {
  rolls: number[];
  modifier: number;
  rawDamage: number;
  armorReduction: number;
  magicResistanceReduction: number;
  finalDamage: number;
}

export function rollDamage(
  expression: DamageExpression,
  characterLevel?: number,
): DamageResult {
  const scaled = getScaledDiceExpression(expression, characterLevel);

  const result = rollDice(scaled.count, scaled.sides, scaled.modifier);

  return {
    rolls: result.rolls,
    modifier: result.modifier,
    rawDamage: result.total,
    armorReduction: 0,
    magicResistanceReduction: 0,
    finalDamage: result.total,
  };
}

export function applyArmor(damage: number, armor: number): number {
  const reduction = Math.max(0, armor);

  return Math.max(0, damage - reduction);
}

function getDamageConditionMultiplier(
  expression: DamageExpression,
  defenderConditions: ConditionState[],
): number {
  if (!expression.conditions || expression.conditions.length === 0) {
    return 1;
  }

  let multiplier = 1;

  for (const condition of expression.conditions) {
    const hasCondition = condition.conditionId
      ? defenderConditions.some(
          (activeCondition) => activeCondition.id === condition.conditionId,
        )
      : defenderConditions.length > 0;

    if (hasCondition) {
      multiplier *= condition.multiplier;
    }
  }

  return multiplier;
}

export function resolveDamage(
  expression: DamageExpression,
  armor: number,
  magicResistance: number,
  _defenderStats: CharacterStats,
  defenderConditions: ConditionState[] = [],
): DamageResult {
  const rolled = rollDamage(expression);

  const damageType = expression.type ?? "physical";

  let armorReduction = 0;
  let magicResistanceReduction = 0;
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

    magicResistanceReduction = Math.max(0, effectiveMagicResistance);
    afterDefense = Math.max(0, rolled.rawDamage - magicResistanceReduction);
  }

  const damageMultiplier = getIncomingDamageMultiplier(defenderConditions);

  const conditionalDamageMultiplier = getDamageConditionMultiplier(
    expression,
    defenderConditions,
  );

  const finalDamage = Math.max(
    0,
    afterDefense * damageMultiplier * conditionalDamageMultiplier,
  );

  return {
    ...rolled,
    armorReduction,
    magicResistanceReduction,
    finalDamage,
  };
}

export function rollCombinedDamage(expressions: DamageExpression[]): number {
  return expressions.reduce(
    (total, expression) => total + rollDamage(expression).rawDamage,
    0,
  );
}

export function getScaledDiceExpression(
  expression: DamageExpression,
  characterLevel?: number,
): {
  count: number;
  sides: number;
  modifier: number;
} {
  let count = expression.count;
  let modifier = expression.modifier ?? 0;

  if (expression.scaling && characterLevel !== undefined) {
    const { diceCount, modifier: scalingModifier } = expression.scaling;

    if (diceCount) {
      const levels = Object.keys(diceCount)
        .map(Number)
        .filter((level) => level <= characterLevel)
        .sort((a, b) => b - a);

      if (levels.length > 0) {
        count = diceCount[levels[0]];
      }
    }

    if (scalingModifier) {
      const levels = Object.keys(scalingModifier)
        .map(Number)
        .filter((level) => level <= characterLevel)
        .sort((a, b) => b - a);

      if (levels.length > 0) {
        modifier += scalingModifier[levels[0]];
      }
    }
  }

  return {
    count,
    sides: expression.sides,
    modifier,
  };
}
