import type { CharacterStats } from "../stats/Stats";
import type { TargetLocation } from "./TargetLocation";
import type { DamageExpression } from "./Damage";
import type { AttackType, AttackResult } from "./Attack";
import type { ConditionState } from "../condition/ConditionState";

export interface CombatAttackRequest {
  attackerId: string;
  defenderId: string;
  type: AttackType;
  distance: number;
  target: TargetLocation;
  damage: DamageExpression;
  attackerConditions: ConditionState[];
  defenderConditions: ConditionState[];
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
