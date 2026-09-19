import type { CombatEngine } from "../combat/CombatEngine";
import type { AbilityEffect } from "./AbilityEffect";
import type { AttackType } from "../combat/Attack";
import type { TargetLocation } from "../combat/TargetLocation";

export interface AbilityEffectContext {
  casterId: string;
  targetId: string;
  attackType?: AttackType;
  targetLocation?: TargetLocation;
  damageSourceId?: string;
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

    if (engine.isDamageBlocked(context.casterId, context.targetId)) {
      return;
    }

    const caster = engine
      .getState()
      .combatants.find((combatant) => combatant.id === context.casterId);

    if (!caster) {
      return;
    }

    const classDamageScaling = effect.classDamageScaling?.[caster.class];

    const damage = {
      ...effect.damage,
      ...classDamageScaling,
    };

    engine.damage(context.targetId, damage);
  }

  function executeHeal(
    effect: AbilityEffect,
    context: AbilityEffectContext,
    engine: CombatEngine,
  ): void {
    if (!effect.healing) {
      throw new Error("Heal effect requires healing.");
    }

    const caster = engine
      .getState()
      .combatants.find((combatant) => combatant.id === context.casterId);

    if (!caster) {
      return;
    }

    const healing = {
      ...effect.healing,
    };

    if (effect.levelScaling) {
      const applicableLevels = Object.keys(effect.levelScaling)
        .map(Number)
        .filter((level) => level <= caster.level)
        .sort((a, b) => b - a);

      const scalingLevel = applicableLevels[0];

      if (scalingLevel !== undefined) {
        const scaling = effect.levelScaling[scalingLevel];

        if (scaling.count !== undefined) {
          healing.count = scaling.count;
        }

        if (scaling.sides !== undefined) {
          healing.sides = scaling.sides;
        }

        if (scaling.modifier !== undefined) {
          healing.modifier = scaling.modifier;
        }
      }
    }

    let amount = 0;

    for (let i = 0; i < healing.count; i++) {
      amount += Math.floor(engine.rollRandom() * healing.sides) + 1;
    }

    if (healing.modifier !== undefined) {
      amount += healing.modifier;
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

    const target = engine
      .getState()
      .combatants.find((combatant) => combatant.id === context.targetId);

    if (!target) {
      return;
    }

    if (
      effect.targetCreatureType !== undefined &&
      target.creatureType !== effect.targetCreatureType
    ) {
      return;
    }

    const caster = engine
      .getState()
      .combatants.find((combatant) => combatant.id === context.casterId);

    if (!caster) {
      return;
    }

    const classConditionScaling = effect.classConditionScaling?.[caster.class];

    engine.applyCondition(
      context.targetId,
      effect.conditionId,
      classConditionScaling?.duration ?? effect.duration ?? 1,
      classConditionScaling?.stacks ?? effect.stacks ?? 1,
      classConditionScaling?.value ?? effect.value,
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
      sourceAbilityId: abilityId,
      sourceCasterId: context.casterId,
      duration: effect.duration,
    };

    engine.addModifier(context.targetId, modifier);
  }
}
