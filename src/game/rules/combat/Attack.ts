import type { CharacterStats } from "../stats/Stats";
import type { TargetLocation } from "./TargetLocation";
import { calculateMeleeAccuracy, calculateRangedAccuracy } from "./Accuracy";
import {
  resolveDamage,
  type DamageExpression,
  type DamageResult,
} from "./Damage";
import { rollPercentage, succeedsPercentage } from "../dice/Dice";

export type AttackType = "melee" | "ranged";

export interface AttackRequest {
  type: AttackType;

  attackerStats: CharacterStats;
  defenderStats: CharacterStats;

  distance: number;
  target: TargetLocation;

  damage: DamageExpression;
  armor: number;
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
        )
      : calculateMeleeAccuracy(
          attack.attackerStats,
          attack.defenderStats,
          attack.target,
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
    attack.defenderStats,
  );

  return {
    hit: true,
    chance,
    roll,
    damage,
  };
}
