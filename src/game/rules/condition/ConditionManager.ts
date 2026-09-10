import { getConditionDefinition, type ConditionId } from "./Condition";
import {
  createCondition,
  isConditionExpired,
  reduceConditionDuration,
} from "./ConditionState";
import type { ConditionState } from "./ConditionState";
import type { ConditionResistanceState } from "../combat/EffectResistance";
import { createConditionResistance } from "../combat/EffectResistance";

export class ConditionManager {
  private conditions: Map<string, ConditionState[]> = new Map();
  private resistances: Map<string, ConditionResistanceState[]> = new Map();

  getConditions(targetId: string): ConditionState[] {
    return [...(this.conditions.get(targetId) ?? [])];
  }

  getCondition(
    targetId: string,
    conditionId: ConditionId,
  ): ConditionState | undefined {
    return this.getConditions(targetId).find(
      (condition) => condition.id === conditionId,
    );
  }

  hasCondition(targetId: string, conditionId: ConditionId): boolean {
    return this.getCondition(targetId, conditionId) !== undefined;
  }

  applyCondition(
    targetId: string,
    conditionId: ConditionId,
    duration: number,
    stacks = 1,
    value?: number,
    sourceId?: string,
  ): ConditionState {
    const existingConditions = this.getConditions(targetId);

    const existingCondition = existingConditions.find(
      (condition) => condition.id === conditionId,
    );

    if (existingCondition) {
      const definition = getConditionDefinition(conditionId);

      if (!definition) {
        throw new Error(`Unknown condition: ${conditionId}`);
      }

      const updatedStacks = Math.min(
        existingCondition.stacks + stacks,
        definition.maxStacks,
      );

      const updatedCondition: ConditionState = {
        ...existingCondition,
        stacks: updatedStacks,
        duration,
        value,
        sourceId,
      };

      const updatedConditions = existingConditions.map((condition) =>
        condition.id === conditionId ? updatedCondition : condition,
      );

      this.conditions.set(targetId, updatedConditions);

      return updatedCondition;
    }

    const newCondition = createCondition(
      conditionId,
      duration,
      stacks,
      value,
      sourceId,
    );

    const definition = getConditionDefinition(conditionId);

    if (!definition) {
      throw new Error(`Unknown condition: ${conditionId}`);
    }

    const cappedCondition: ConditionState = {
      ...newCondition,
      stacks: Math.min(stacks, definition.maxStacks),
    };

    this.conditions.set(targetId, [...existingConditions, cappedCondition]);

    return cappedCondition;
  }

  removeCondition(targetId: string, conditionId: ConditionId): boolean {
    const existingConditions = this.getConditions(targetId);

    const filteredConditions = existingConditions.filter(
      (condition) => condition.id !== conditionId,
    );

    if (filteredConditions.length === existingConditions.length) {
      return false;
    }

    this.conditions.set(targetId, filteredConditions);

    return true;
  }

  reduceDuration(
    targetId: string,
    conditionId: ConditionId,
    amount = 1,
  ): boolean {
    const existingConditions = this.getConditions(targetId);

    const condition = existingConditions.find(
      (condition) => condition.id === conditionId,
    );

    if (!condition) {
      return false;
    }

    const updatedCondition = reduceConditionDuration(condition, amount);

    if (isConditionExpired(updatedCondition)) {
      return this.removeCondition(targetId, conditionId);
    }

    const updatedConditions = existingConditions.map((currentCondition) =>
      currentCondition.id === conditionId ? updatedCondition : currentCondition,
    );

    this.conditions.set(targetId, updatedConditions);

    return true;
  }

  clearExpiredConditions(targetId: string): void {
    const activeConditions = this.getConditions(targetId).filter(
      (condition) => !isConditionExpired(condition),
    );

    this.conditions.set(targetId, activeConditions);
  }

  clearConditions(targetId: string): void {
    this.conditions.delete(targetId);
  }

  processRoundStart(): void {
    for (const [targetId, conditions] of this.conditions.entries()) {
      const updatedConditions: ConditionState[] = [];

      for (const condition of conditions) {
        const updatedCondition = reduceConditionDuration(condition, 1);

        if (!isConditionExpired(updatedCondition)) {
          updatedConditions.push(updatedCondition);
        }
      }

      if (updatedConditions.length === 0) {
        this.conditions.delete(targetId);
      } else {
        this.conditions.set(targetId, updatedConditions);
      }
    }
  }

  getAllConditions(): Map<string, ConditionState[]> {
    return new Map(
      [...this.conditions.entries()].map(([targetId, conditions]) => [
        targetId,
        [...conditions],
      ]),
    );
  }

  getConditionResistance(
    targetId: string,
    conditionId: ConditionId,
  ): ConditionResistanceState {
    const existing = this.resistances
      .get(targetId)
      ?.find((state) => state.conditionId === conditionId);

    if (existing) {
      return { ...existing };
    }

    return createConditionResistance(conditionId);
  }

  public setConditionResistance(
    targetId: string,
    state: ConditionResistanceState,
  ): void {
    const existing = this.resistances.get(targetId) ?? [];

    const updated = existing.some(
      (current) => current.conditionId === state.conditionId,
    )
      ? existing.map((current) =>
          current.conditionId === state.conditionId ? state : current,
        )
      : [...existing, state];

    this.resistances.set(targetId, updated);
  }
}
