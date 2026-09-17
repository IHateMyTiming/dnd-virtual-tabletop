import type { CombatEngine } from "../combat/CombatEngine";
import type { AbilityEffect } from "./AbilityEffect";
import type { AttackType } from "../combat/Attack";
import type { TargetLocation } from "../combat/TargetLocation";

export interface AbilityEffectContext {
  casterId: string;
  targetId: string;
  attackType?: AttackType;
  targetLocation?: TargetLocation;
}

export function executeAbilityEffects(
  effects: AbilityEffect[],
  context: AbilityEffectContext,
  engine: CombatEngine,
  abilityId: string,
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

      case "modify-behavior":
        executeModifyBehavior(effect, context, engine, abilityId);
        break;

      case "move":
      case "teleport":
      case "modify-stat":
        throw new Error(
          `Ability effect "${effect.type}" is not implemented yet.`,
        );
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
    if (!effect.healing) {
      throw new Error("Heal effect requires healing.");
    }

    let amount = 0;

    for (let i = 0; i < effect.healing.count; i++) {
      amount += Math.floor(Math.random() * effect.healing.sides) + 1;
    }

    if (effect.healing.modifier !== undefined) {
      amount += effect.healing.modifier;
    }

    engine.heal(context.targetId, amount);
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

  function executeModifyBehavior(
    effect: AbilityEffect,
    context: AbilityEffectContext,
    engine: CombatEngine,
    abilityId: string,
  ): void {
    if (!effect.modifier) {
      throw new Error("Modify-behavior effect requires a modifier.");
    }

    const modifier = {
      ...effect.modifier,
      id: `${abilityId}:${effect.modifier.behavior}:${effect.modifier.operation}:${effect.modifier.trigger}`,
      duration: effect.duration,
    };

    console.log("=== APPLYING ABILITY MODIFIER ===");
    console.log("Ability:", abilityId);
    console.log("Target:", context.targetId);
    console.log("Behavior:", modifier.behavior);
    console.log("Operation:", modifier.operation);
    console.log("Trigger:", modifier.trigger);
    console.log("Dice:", modifier.diceCount, "d", modifier.diceSides);
    console.log("Value:", modifier.value);
    console.log("Amount:", modifier.amount);
    console.log("Duration:", modifier.duration);
    console.log("Modifier ID:", modifier.id);
    console.log("=================================");

    engine.addModifier(context.targetId, modifier);
  }
}
