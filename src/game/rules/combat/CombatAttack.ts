import type { CharacterStats } from "../stats/Stats";
import type { TargetLocation } from "./TargetLocation";
import type { DamageExpression, DamageResult } from "./Damage";
import type { AttackType, AttackResult } from "./Attack";

export interface CombatAttackRequest {
  attackerId: string;
  defenderId: string;
  type: AttackType;
  distance: number;
  target: TargetLocation;
  damage: DamageExpression;
}

export interface CombatAttackResult {
  success: boolean;
  attackerId: string;
  defenderId: string;
  attack?: AttackResult;
  attackerStats?: CharacterStats;
  defenderStats?: CharacterStats;
  defenderHpBefore?: number;
  defenderHpAfter?: number;
}
