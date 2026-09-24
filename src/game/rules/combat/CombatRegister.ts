import type { DamageType } from "./Damage";
import type { ConditionId } from "../condition/Condition";

export type CombatEventType =
  | "damage"
  | "healing"
  | "condition-applied"
  | "condition-removed"
  | "ability-used";

export interface CombatEvent {
  id: number;
  type: CombatEventType;

  round: number;

  sourceId?: string;
  targetId?: string;

  amount?: number;

  damageType?: DamageType;
  abilityId?: string;
  conditionId?: ConditionId;
}

export class CombatRegister {
  private events: CombatEvent[] = [];
  private nextEventId = 1;

  record(event: Omit<CombatEvent, "id">): void {
    this.events.push({
      id: this.nextEventId++,
      ...event,
    });
  }

  getEvents(): CombatEvent[] {
    return [...this.events];
  }

  getEventsByType(type: CombatEventType): CombatEvent[] {
    return this.events.filter((event) => event.type === type);
  }

  getEventsForTarget(targetId: string): CombatEvent[] {
    return this.events.filter((event) => event.targetId === targetId);
  }

  getEventsSinceRound(round: number): CombatEvent[] {
    return this.events.filter((event) => event.round >= round);
  }

  getDamageTakenInRounds(
    targetId: string,
    startRound: number,
    endRound: number,
  ): number {
    return this.events
      .filter(
        (event) =>
          event.type === "damage" &&
          event.targetId === targetId &&
          event.round >= startRound &&
          event.round <= endRound,
      )
      .reduce((total, event) => total + (event.amount ?? 0), 0);
  }

  getHealingReceivedInRounds(
    targetId: string,
    startRound: number,
    endRound: number,
  ): number {
    return this.events
      .filter(
        (event) =>
          event.type === "healing" &&
          event.targetId === targetId &&
          event.round >= startRound &&
          event.round <= endRound,
      )
      .reduce((total, event) => total + (event.amount ?? 0), 0);
  }

  getDamageTakenSinceRound(targetId: string, round: number): number {
    return this.events
      .filter(
        (event) =>
          event.type === "damage" &&
          event.targetId === targetId &&
          event.round >= round,
      )
      .reduce((total, event) => total + (event.amount ?? 0), 0);
  }

  clear(): void {
    this.events = [];
    this.nextEventId = 1;
  }
}
