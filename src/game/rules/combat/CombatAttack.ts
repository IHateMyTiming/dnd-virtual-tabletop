import type { CharacterStats } from "../stats/Stats";
import type { TargetLocation } from "./TargetLocation";
import type { DamageExpression } from "./Damage";
import type { AttackType, AttackResult } from "./Attack";
import type { ConditionState } from "../condition/ConditionState";
import type { DamageResult } from "./Damage";
import type { AbilityEffect } from "../abilities/AbilityEffect";

export interface CombatAttackRequest {
  attackerId: string;
  defenderId: string;
  type: AttackType;
  distance: number;
  target: TargetLocation;
  damage: DamageExpression;
  attackerConditions: ConditionState[];
  defenderConditions: ConditionState[];
  attackerLevel: number;
  abilityId?: string;
  remainingEffects?: AbilityEffect[];
}

export interface CombatAttackResult {
  success: boolean;
  status?: CombatAttackStatus;

  attackerId: string;
  defenderId: string;

  attack?: AttackResult;
  damage?: DamageResult;

  parried?: boolean;
  dodged?: boolean;

  attackerStats?: CharacterStats;
  defenderStats?: CharacterStats;

  defenderHpBefore?: number;
  defenderHpAfter?: number;
}

export type CombatAttackStatus = "resolved" | "awaiting-defense";
