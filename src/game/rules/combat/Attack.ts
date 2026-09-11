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

  const critThreshold = chance * 0.1;

  const advantageState = getAttackAdvantageState(
    attack.attackerConditions,
    attack.defenderConditions,
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
  return {
    damage: rollDamage(attack.damage),
  };
}
