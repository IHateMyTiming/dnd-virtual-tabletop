import type { CharacterStats } from "../stats/Stats";
import type { TargetLocation } from "./TargetLocation";

import {
  calculateMeleeAccuracy,
  calculateSpellAccuracy,
  calculateRangedAccuracy,
} from "./Accuracy";

import { rollDamage, type DamageExpression, type DamageResult } from "./Damage";

import { rollPercentage, succeedsPercentage } from "../dice/Dice";
import type { ConditionState } from "../condition/ConditionState";

export type AttackType = "melee" | "ranged" | "spell";

export interface AttackRequest {
  attackerId: string;
  defenderId: string;
  attackerStats: CharacterStats;
  defenderStats: CharacterStats;
  defenderConditions: ConditionState[];
  attackerConditions: ConditionState[];
  armor: number;
  magicResistance: number;
  distance: number;
  target: TargetLocation;
  damage: DamageExpression;
  type: AttackType;
  patternBonus?: number;
}

export interface AttackResult {
  hit: boolean;
  chance: number;
  roll: number;
}

export interface AttackDamageResult {
  damage: DamageResult;
}

export function resolveAttack(attack: AttackRequest): AttackResult {
  const chance =
    attack.type === "ranged"
      ? calculateRangedAccuracy(
          attack.attackerStats,
          attack.distance,
          attack.target,
          attack.attackerConditions,
        )
      : attack.type === "melee"
        ? calculateMeleeAccuracy(
            attack.attackerStats,
            attack.target,
            attack.attackerConditions,
            attack.patternBonus ?? 0,
          )
        : calculateSpellAccuracy(attack.attackerStats, attack.defenderStats);

  const roll = rollPercentage();
  const hit = succeedsPercentage(chance, roll);

  return {
    hit,
    chance,
    roll,
  };
}

export function rollAttackDamage(attack: AttackRequest): AttackDamageResult {
  return {
    damage: rollDamage(attack.damage),
  };
}
