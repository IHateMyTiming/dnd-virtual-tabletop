import type { CreatureType } from "./Combatant";
import type { Ability } from "../stats/Stats";

export type CombatModifierBehavior =
  | "damage"
  | "accuracy"
  | "attack-roll"
  | "defense"
  | "movement"
  | "armor"
  | "armor-penetration"
  | "magic-resistance"
  | "magic-penetration"
  | "concentration"
  | "stat";

export type CombatModifierOperation =
  | "add"
  | "multiply"
  | "add-dice"
  | "advantage"
  | "disadvantage";

export type CombatModifierTrigger =
  | "roll"
  | "attack"
  | "spell"
  | "turn"
  | "concentration";

export type CombatThresholdType =
  | "health-percent"
  | "mana-percent"
  | "distance"
  | "turn";

export type CombatThresholdOperator =
  | "less-than"
  | "less-than-or-equal"
  | "equal"
  | "greater-than"
  | "greater-than-or-equal";

export interface CombatThreshold {
  type: CombatThresholdType;
  operator: CombatThresholdOperator;
  value: number;
  target: CombatThresholdTarget;
}

export type CombatThresholdTarget = "caster" | "target";

export interface CombatModifier {
  behavior: CombatModifierBehavior;
  operation: CombatModifierOperation;
  stat?: Ability;
  trigger: CombatModifierTrigger;

  value?: number;

  diceCount?: number;
  diceSides?: number;

  amount?: number;
  duration?: number;
  id?: string;
  targetId?: string;
  threshold?: CombatThreshold;
  targetCreatureType?: CreatureType;
  sourceAbilityId?: string;
  sourceCasterId?: string;

  temporaryHp?: number;

  damageSharing?: {
    partnerId: string;
    percentage: number;
  };
}

export function getModifiersForTrigger(
  modifiers: CombatModifier[],
  trigger: CombatModifierTrigger,
): CombatModifier[] {
  return modifiers.filter(
    (modifier) =>
      modifier.trigger === trigger &&
      (modifier.amount === undefined || modifier.amount > 0),
  );
}

export function consumeModifier(
  modifiers: CombatModifier[],
  modifier: CombatModifier,
): void {
  if (modifier.amount === undefined) {
    return;
  }

  modifier.amount -= 1;

  if (modifier.amount <= 0) {
    const index = modifiers.indexOf(modifier);

    if (index !== -1) {
      modifiers.splice(index, 1);
    }
  }
}

export function getModifierValue(
  modifiers: CombatModifier[],
  behavior: CombatModifierBehavior,
  operation: CombatModifierOperation,
  trigger?: CombatModifierTrigger,
): number {
  return modifiers
    .filter(
      (modifier) =>
        (modifier.amount === undefined || modifier.amount > 0) &&
        modifier.behavior === behavior &&
        modifier.operation === operation &&
        (trigger === undefined || modifier.trigger === trigger),
    )
    .reduce((total, modifier) => total + (modifier.value ?? 0), 0);
}

export function getModifierMultiplier(
  modifiers: CombatModifier[],
  behavior: CombatModifierBehavior,
  trigger?: CombatModifierTrigger,
): number {
  return modifiers
    .filter(
      (modifier) =>
        (modifier.amount === undefined || modifier.amount > 0) &&
        modifier.behavior === behavior &&
        modifier.operation === "multiply" &&
        (trigger === undefined || modifier.trigger === trigger),
    )
    .reduce((total, modifier) => total * (modifier.value ?? 1), 1);
}

export function isThresholdMet(
  threshold: CombatThreshold,
  currentValue: number,
): boolean {
  switch (threshold.operator) {
    case "less-than":
      return currentValue < threshold.value;

    case "less-than-or-equal":
      return currentValue <= threshold.value;

    case "equal":
      return currentValue === threshold.value;

    case "greater-than":
      return currentValue > threshold.value;

    case "greater-than-or-equal":
      return currentValue >= threshold.value;
  }
}

export function getActiveModifiers(
  modifiers: CombatModifier[],
  context: {
    casterHealthPercent?: number;
    casterManaPercent?: number;
    targetHealthPercent?: number;
    targetManaPercent?: number;
    targetCreatureType?: CreatureType;
    targetId?: string;
    distance?: number;
    turn?: number;
  },
): CombatModifier[] {
  return modifiers.filter((modifier) => {
    if (
      modifier.targetId !== undefined &&
      modifier.targetId !== context.targetId
    ) {
      return false;
    }

    if (
      modifier.targetCreatureType !== undefined &&
      modifier.targetCreatureType !== context.targetCreatureType
    ) {
      return false;
    }

    if (!modifier.threshold) {
      return true;
    }

    const threshold = modifier.threshold;

    let currentValue: number | undefined;

    switch (threshold.type) {
      case "health-percent":
        currentValue =
          threshold.target === "caster"
            ? context.casterHealthPercent
            : context.targetHealthPercent;
        break;

      case "mana-percent":
        currentValue =
          threshold.target === "caster"
            ? context.casterManaPercent
            : context.targetManaPercent;
        break;

      case "distance":
        currentValue = context.distance;
        break;

      case "turn":
        currentValue = context.turn;
        break;
    }

    if (currentValue === undefined) {
      return false;
    }

    return isThresholdMet(threshold, currentValue);
  });
}
