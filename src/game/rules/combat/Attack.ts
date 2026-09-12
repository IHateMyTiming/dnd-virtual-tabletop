import type { CharacterStats } from "../stats/Stats";
import type { TargetLocation } from "./TargetLocation";

import {
  calculateMeleeAccuracy,
  calculateSpellAccuracy,
  calculateRangedAccuracy,
} from "./Accuracy";

import { rollDamage, type DamageExpression, type DamageResult } from "./Damage";

import type { ConditionState } from "../condition/ConditionState";

import {
  getAttackAdvantageState,
  resolveAdvantage,
  type AdvantageState,
} from "./Advantage";

import type { AttackOutcome } from "./Advantage";
import type { CombatModifier } from "./CombatModifier";

export type AttackType = "melee" | "ranged" | "spell";

export interface AttackRequest {
  attackerId: string;
  defenderId: string;

  attackerStats: CharacterStats;
  defenderStats: CharacterStats;

  attackerConditions: ConditionState[];
  defenderConditions: ConditionState[];

  attackerModifiers: CombatModifier[];

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

export interface AttackDamageResult {
  damage: DamageResult;
}

export function resolveAttack(attack: AttackRequest): AttackResult {
  const attackModifiers = getAttackModifiers(
    attack.attackerModifiers,
    attack.type,
  );

  const baseChance = calculateBaseAccuracy(attack);

  const accuracyModifier = getAccuracyModifier(attackModifiers);

  const chance = Math.max(0, Math.min(100, baseChance + accuracyModifier));

  const critThreshold = chance * 0.1;

  const conditionAdvantage = getAttackAdvantageState(
    attack.attackerConditions,
    attack.defenderConditions,
  );

  const modifierAdvantage = getModifierAdvantage(attackModifiers);

  const advantageState = resolveCombinedAdvantage(
    conditionAdvantage,
    modifierAdvantage,
  );

  const result = resolveAdvantage(advantageState, chance, critThreshold);

  return {
    hit: result.selectedOutcome !== "miss",

    chance,

    rolls: result.rolls,
    outcomes: result.outcomes,

    selectedRoll: result.selectedRoll,
    selectedOutcome: result.selectedOutcome,

    advantageState,

    criticalHit: result.selectedOutcome === "critical",
  };
}

export function rollAttackDamage(attack: AttackRequest): AttackDamageResult {
  const attackModifiers = getDamageModifiers(
    attack.attackerModifiers,
    attack.type,
  );

  const damage = rollModifiedDamage(
    attack.damage,
    attack.attackerLevel,
    attackModifiers,
  );

  return {
    damage,
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
    if (modifier.amount <= 0) {
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

function getAccuracyModifier(modifiers: CombatModifier[]): number {
  return modifiers
    .filter(
      (modifier) =>
        modifier.behavior === "accuracy" && modifier.operation === "add",
    )
    .reduce((total, modifier) => total + (modifier.value ?? 0), 0);
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
): DamageResult {
  const damageModifiers = modifiers.filter(
    (modifier) => modifier.behavior === "damage",
  );

  const base = rollDamage(expression, characterLevel);

  let rawDamage = base.rawDamage;
  let rolls = [...base.rolls];
  let modifier = base.modifier;

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
    if (modifier.amount <= 0) {
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
