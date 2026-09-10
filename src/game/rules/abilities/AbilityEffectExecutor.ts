import type { CombatEngine } from "../combat/CombatEngine";
import type { AbilityEffect } from "./AbilityEffect";

export interface AbilityEffectContext {
  casterId: string;
  targetId: string;
}

export function executeAbilityEffects(
  effects: AbilityEffect[],
  context: AbilityEffectContext,
  engine: CombatEngine,
): void {
  for (const effect of effects) {
    switch (effect.type) {
      case "damage":
        executeDamage(effect, context, engine);
        break;

      case "heal":
        executeHeal(effect, context, engine);
        break;

      case "apply-condition":
        executeApplyCondition(effect, context, engine);
        break;

      case "remove-condition":
        executeRemoveCondition(effect, context, engine);
        break;

      case "move":
      case "teleport":
      case "modify-stat":
        throw new Error(
          `Ability effect "${effect.type}" is not implemented yet.`,
        );
    }
  }
}

function executeDamage(
  effect: AbilityEffect,
  context: AbilityEffectContext,
  engine: CombatEngine,
): void {
  if (!effect.damage) {
    throw new Error("Damage effect requires damage.");
  }

  engine.damage(context.targetId, effect.damage);
}

function executeHeal(
  effect: AbilityEffect,
  context: AbilityEffectContext,
  engine: CombatEngine,
): void {
  if (effect.value === undefined) {
    throw new Error("Heal effect requires a value.");
  }

  engine.heal(context.targetId, effect.value);
}

function executeApplyCondition(
  effect: AbilityEffect,
  context: AbilityEffectContext,
  engine: CombatEngine,
): void {
  if (!effect.conditionId) {
    throw new Error("Apply-condition effect requires a conditionId.");
  }

  engine.applyCondition(
    context.targetId,
    effect.conditionId,
    effect.duration ?? 1,
    effect.stacks ?? 1,
    effect.value,
    context.casterId,
  );
}

function executeRemoveCondition(
  effect: AbilityEffect,
  context: AbilityEffectContext,
  engine: CombatEngine,
): void {
  if (!effect.conditionId) {
    throw new Error("Remove-condition effect requires a conditionId.");
  }

  engine.removeCondition(context.targetId, effect.conditionId);
}
