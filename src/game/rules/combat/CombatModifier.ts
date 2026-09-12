export type CombatModifierBehavior =
  | "damage"
  | "accuracy"
  | "attack-roll"
  | "defense"
  | "movement"
  | "armor"
  | "magic-resistance";

export type CombatModifierOperation =
  | "add"
  | "multiply"
  | "add-dice"
  | "advantage"
  | "disadvantage";

export type CombatModifierTrigger = "roll" | "attack" | "spell" | "turn";

export interface CombatModifier {
  behavior: CombatModifierBehavior;
  operation: CombatModifierOperation;
  trigger: CombatModifierTrigger;

  value?: number;

  diceCount?: number;
  diceSides?: number;

  amount: number;
}

export function getModifiersForTrigger(
  modifiers: CombatModifier[],
  trigger: CombatModifierTrigger,
): CombatModifier[] {
  return modifiers.filter(
    (modifier) => modifier.trigger === trigger && modifier.amount > 0,
  );
}

export function consumeModifier(
  modifiers: CombatModifier[],
  modifier: CombatModifier,
): void {
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
        modifier.amount > 0 &&
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
        modifier.amount > 0 &&
        modifier.behavior === behavior &&
        modifier.operation === "multiply" &&
        (trigger === undefined || modifier.trigger === trigger),
    )
    .reduce((total, modifier) => total * (modifier.value ?? 1), 1);
}
