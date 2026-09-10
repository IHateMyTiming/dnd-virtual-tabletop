import type { CharacterStats } from "../stats/Stats";
import type { TargetLocation } from "./TargetLocation";
import { calculateMeleeAccuracy, calculateRangedAccuracy } from "./Accuracy";
import {
  resolveDamage,
  type DamageExpression,
  type DamageResult,
} from "./Damage";
import { rollPercentage, succeedsPercentage } from "../dice/Dice";
import type { ConditionState } from "../condition/ConditionState";
import { getFrightenedDamageMultiplier } from "../condition/ConditionFear";

export type AttackType = "melee" | "ranged";

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
}

export interface AttackResult {
  hit: boolean;

  chance: number;
  roll: number;

  damage?: DamageResult;
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
      : calculateMeleeAccuracy(
          attack.attackerStats,
          attack.defenderStats,
          attack.target,
          attack.attackerConditions,
          attack.defenderConditions,
        );

  const roll = rollPercentage();
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
    attack.armor,
    attack.magicResistance,
    attack.defenderStats,
    attack.defenderConditions,
  );

  const frightenedMultiplier = getFrightenedDamageMultiplier(
    attack.attackerConditions,
    attack.defenderId,
  );

  const finalDamage = damage.finalDamage * frightenedMultiplier;

  return {
    hit: true,
    chance,
    roll,
    damage: {
      ...damage,
      finalDamage,
    },
  };
}
