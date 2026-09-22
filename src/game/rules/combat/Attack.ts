import type { CharacterStats } from "../stats/Stats";
import type { TargetLocation } from "./TargetLocation";
import { roundToOneDecimal, rollDie, succeedsPercentage } from "../dice/Dice";
import {
  calculateMeleeAccuracy,
  calculateRangedAccuracy,
  calculateSpellAccuracy,
  getSpellPrecision,
} from "./Accuracy";

import {
  rollDamage,
  resolveDamage,
  type DamageExpression,
  type DamageResult,
} from "./Damage";

import type { ConditionState } from "../condition/ConditionState";

import {
  getAttackAdvantageState,
  resolveAdvantage,
  type AdvantageState,
} from "./Advantage";

import type { AttackOutcome } from "./Advantage";
import {
  getModifierValue,
  getModifierMultiplier,
  getActiveModifiers,
  type CombatModifier,
} from "./CombatModifier";
import type { CreatureType } from "./Combatant";

export type AttackType = "melee" | "ranged" | "spell";

export interface CombatModifierContext {
  casterHealthPercent?: number;
  casterManaPercent?: number;

  targetHealthPercent?: number;
  targetManaPercent?: number;

  distance?: number;
  turn?: number;

  targetCreatureType?: CreatureType;
  targetId?: string;
}

export interface AttackRequest {
  attackerId: string;
  defenderId: string;

  attackerStats: CharacterStats;
  defenderStats: CharacterStats;

  attackerConditions: ConditionState[];
  defenderConditions: ConditionState[];

  attackerModifiers: CombatModifier[];
  defenderModifiers: CombatModifier[];

  armor: number;
  magicResistance: number;

  distance: number;
  target: TargetLocation;

  damage: DamageExpression;
  type: AttackType;

  patternBonus?: number;
  attackerLevel: number;
}

export interface AttackResult {
  hit: boolean;
  chance: number;

  rolls: number[];
  outcomes: AttackOutcome[];

  selectedRoll: number;
  selectedOutcome: AttackOutcome;

  advantageState: AdvantageState;

  criticalHit: boolean;
}

export interface AbilityInstanceAttackRequest {
  attackerStats: CharacterStats;
  attackerConditions: ConditionState[];
  type: AttackType;
  distance: number;
  target: TargetLocation;
  damage: DamageExpression;
  armor?: number;
  magicResistance?: number;
}

export interface AbilityInstanceAttackResult {
  hit: boolean;
  chance: number;
  roll: number;
  damage?: DamageResult;
}

export interface AttackDamageResult {
  damage: DamageResult;
}

export function resolveAttack(attack: AttackRequest): AttackResult {
  const attackModifiers = getAttackModifiers(
    attack.attackerModifiers,
    attack.type,
  );

  const defenseModifiers = getAttackModifiers(
    attack.defenderModifiers,
    attack.type,
  );

  const baseChance = calculateBaseAccuracy(attack);

  const accuracyModifier = getModifierValue(attackModifiers, "accuracy", "add");

  const accuracyMultiplier = getModifierMultiplier(attackModifiers, "accuracy");

  const chance = roundToOneDecimal(
    Math.max(
      0,
      Math.min(100, (baseChance + accuracyModifier) * accuracyMultiplier),
    ),
  );

  const critThreshold = chance * 0.1;

  const conditionAdvantage = getAttackAdvantageState(
    attack.attackerConditions,
    attack.defenderConditions,
  );

  const modifierAdvantage = getModifierAdvantage(attackModifiers);

  const defenseAdvantage = getDefenseAdvantage(defenseModifiers);

  const advantageState = resolveCombinedAdvantage(
    conditionAdvantage,
    modifierAdvantage,
  );

  const finalAdvantageState = resolveCombinedAdvantage(
    advantageState,
    defenseAdvantage,
  );

  const attackRollModifier = getAttackRollDiceModifier(attackModifiers);

  const result = resolveAdvantage(
    finalAdvantageState,
    chance,
    critThreshold,
    undefined,
    attackRollModifier,
  );

  return {
    hit: result.selectedOutcome !== "miss",

    chance,

    rolls: result.rolls,
    outcomes: result.outcomes,

    selectedRoll: result.selectedRoll,
    selectedOutcome: result.selectedOutcome,

    advantageState: finalAdvantageState,

    criticalHit: result.selectedOutcome === "critical",
  };
}

export function rollAttackDamage(
  attack: AttackRequest,
  modifierContext?: CombatModifierContext,
): AttackDamageResult {
  const activeModifiers = getActiveModifiers(
    attack.attackerModifiers,
    modifierContext ?? {},
  );

  const attackModifiers = getDamageModifiers(activeModifiers, attack.type);

  const damage = rollModifiedDamage(
    attack.damage,
    attack.attackerLevel,
    attackModifiers,
    attack.defenderConditions,
  );

  return {
    damage,
  };
}

function getAttackRollDiceModifier(
  modifiers: CombatModifier[],
): (() => number) | undefined {
  const diceModifiers = modifiers.filter(
    (modifier) =>
      modifier.behavior === "attack-roll" &&
      modifier.operation === "add-dice" &&
      modifier.trigger === "roll",
  );

  if (diceModifiers.length === 0) {
    return undefined;
  }

  return () => {
    let total = 0;

    for (const modifier of diceModifiers) {
      const diceCount = modifier.diceCount ?? 0;
      const diceSides = modifier.diceSides ?? 0;

      for (let i = 0; i < diceCount; i++) {
        const roll = rollDie(diceSides);

        //console.log(`Attack roll bonus: d${diceSides} rolled ${roll}`);

        total += roll;
      }
    }

    return total;
  };
}

function calculateBaseAccuracy(attack: AttackRequest): number {
  switch (attack.type) {
    case "ranged":
      return calculateRangedAccuracy(
        attack.attackerStats,
        attack.distance,
        attack.target,
        attack.attackerConditions,
      );

    case "melee":
      return calculateMeleeAccuracy(
        attack.attackerStats,
        attack.target,
        attack.attackerConditions,
        attack.patternBonus ?? 0,
      );

    case "spell":
      return calculateSpellAccuracy(attack.attackerStats, attack.defenderStats);
  }
}

function getAttackModifiers(
  modifiers: CombatModifier[],
  type: AttackType,
): CombatModifier[] {
  return modifiers.filter((modifier) => {
    if (modifier.amount !== undefined && modifier.amount <= 0) {
      return false;
    }

    switch (modifier.trigger) {
      case "roll":
      case "attack":
        return true;

      case "spell":
        return type === "spell";

      case "turn":
        return false;
    }
  });
}

function getDefenseAdvantage(modifiers: CombatModifier[]): AdvantageState {
  const hasAdvantage = modifiers.some(
    (modifier) =>
      modifier.behavior === "defense" && modifier.operation === "advantage",
  );

  const hasDisadvantage = modifiers.some(
    (modifier) =>
      modifier.behavior === "defense" && modifier.operation === "disadvantage",
  );

  if (hasAdvantage && hasDisadvantage) {
    return "normal";
  }

  if (hasAdvantage) {
    return "advantage";
  }

  if (hasDisadvantage) {
    return "disadvantage";
  }

  return "normal";
}

function getModifierAdvantage(modifiers: CombatModifier[]): AdvantageState {
  const hasAdvantage = modifiers.some(
    (modifier) =>
      modifier.behavior === "attack-roll" && modifier.operation === "advantage",
  );

  const hasDisadvantage = modifiers.some(
    (modifier) =>
      modifier.behavior === "attack-roll" &&
      modifier.operation === "disadvantage",
  );

  if (hasAdvantage && hasDisadvantage) {
    return "normal";
  }

  if (hasAdvantage) {
    return "advantage";
  }

  if (hasDisadvantage) {
    return "disadvantage";
  }

  return "normal";
}

function resolveCombinedAdvantage(
  conditionState: AdvantageState,
  modifierState: AdvantageState,
): AdvantageState {
  if (conditionState === "normal") {
    return modifierState;
  }

  if (modifierState === "normal") {
    return conditionState;
  }

  if (conditionState === modifierState) {
    return conditionState;
  }

  return "normal";
}

function rollModifiedDamage(
  expression: DamageExpression,
  characterLevel: number,
  modifiers: CombatModifier[],
  defenderConditions: ConditionState[],
): DamageResult {
  const damageModifiers = modifiers.filter(
    (modifier) => modifier.behavior === "damage",
  );

  const base = rollDamage(expression, characterLevel);

  let rawDamage = base.rawDamage;
  let rolls = [...base.rolls];
  let modifier = base.modifier;

  // Damage modifiers from the attacker/item/etc.
  for (const damageModifier of damageModifiers) {
    switch (damageModifier.operation) {
      case "add":
        rawDamage += damageModifier.value ?? 0;
        modifier += damageModifier.value ?? 0;
        break;

      case "add-dice": {
        const diceCount = damageModifier.diceCount ?? 0;
        const diceSides = damageModifier.diceSides ?? 0;

        if (diceCount <= 0 || diceSides <= 0) {
          break;
        }

        const extra = rollDamage({
          count: diceCount,
          sides: diceSides,
        });

        rolls.push(...extra.rolls);
        rawDamage += extra.rawDamage;
        break;
      }

      case "multiply":
        rawDamage *= damageModifier.value ?? 1;
        break;

      case "advantage":
      case "disadvantage":
        break;
    }
  }

  // Damage multipliers based on the target's conditions.
  if (expression.conditions) {
    for (const condition of expression.conditions) {
      if (condition.type === "target-has-condition") {
        if (defenderConditions.length > 0) {
          rawDamage *= condition.multiplier;
        }
      }
    }
  }

  return {
    ...base,
    rolls,
    modifier,
    rawDamage,
    finalDamage: rawDamage,
  };
}

function getDamageModifiers(
  modifiers: CombatModifier[],
  type: AttackType,
): CombatModifier[] {
  return modifiers.filter((modifier) => {
    if (modifier.amount !== undefined && modifier.amount <= 0) {
      return false;
    }

    if (modifier.trigger === "attack") {
      return true;
    }

    if (modifier.trigger === "spell" && type === "spell") {
      return true;
    }

    return false;
  });
}

export function resolveAbilityInstanceAttack(
  attack: AbilityInstanceAttackRequest,
  random: () => number = Math.random,
): AbilityInstanceAttackResult {
  let chance: number;

  switch (attack.type) {
    case "melee":
      chance = calculateMeleeAccuracy(
        attack.attackerStats,
        attack.target,
        attack.attackerConditions,
      );
      break;

    case "ranged":
      chance = calculateRangedAccuracy(
        attack.attackerStats,
        attack.distance,
        attack.target,
        attack.attackerConditions,
      );
      break;

    case "spell":
      chance = getSpellPrecision(attack.attackerStats.intelligence);
      break;
  }

  const roll = random() * 100;
  const hit = succeedsPercentage(chance, roll);

  if (!hit) {
    return {
      hit: false,
      chance,
      roll,
    };
  }

  const damage = resolveDamage(
    attack.damage,
    attack.armor ?? 0,
    attack.magicResistance ?? 0,
    attack.attackerStats,
    [],
  );
  damage.finalDamage = Math.max(1, damage.finalDamage);

  return {
    hit: true,
    chance,
    roll,
    damage,
  };
}
