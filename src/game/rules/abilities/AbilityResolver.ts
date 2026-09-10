import type { AbilityDefinition } from "./Ability";
import {
  isAbilityAvailable,
  useAbility,
  type AbilityState,
} from "./AbilityState";
import {
  consumeSpellSlot,
  hasSpellSlot,
  type CharacterResources,
} from "./Resource";
import { validateAbilityTarget, type AbilityTarget } from "./AbilityTarget";
import type { CombatState } from "../combat/CombatState";
import type { CombatEngine } from "../combat/CombatEngine";
import { executeAbilityEffects } from "./AbilityEffectExecutor";
import {
  canUseAction,
  canUseBonusAction,
  canUseReaction,
  canUseSpells,
} from "../condition/ConditionRestrictions";
import type {
  CombatAttackRequest,
  CombatAttackResult,
} from "../combat/CombatAttack";

export interface AbilityUseRequest {
  ability: AbilityDefinition;
  state: AbilityState;
  resources: CharacterResources;
  casterId: string;
  target: AbilityTarget;
  combatState: CombatState;
  combatEngine: CombatEngine;
}

export interface AbilityUseResult {
  success: boolean;
  abilityId: string;
  abilityState?: AbilityState;
  resources?: CharacterResources;
  reason?: string;
  attackResult?: CombatAttackResult;
}

export function resolveAbility(request: AbilityUseRequest): AbilityUseResult {
  const {
    ability,
    state,
    resources,
    casterId,
    target,
    combatState,
    combatEngine,
  } = request;

  if (state.abilityId !== ability.id) {
    return {
      success: false,
      abilityId: ability.id,
      reason: "Ability state does not match ability.",
    };
  }

  if (!isAbilityAvailable(ability, state)) {
    return {
      success: false,
      abilityId: ability.id,
      reason: "Ability is not available.",
    };
  }

  const casterConditions = combatState.conditionManager.getConditions(casterId);
  const defenderConditions = combatState.conditionManager.getConditions(
    target.id,
  );

  if (ability.isSpell && !canUseSpells(casterConditions)) {
    return {
      success: false,
      abilityId: ability.id,
      reason: "Caster cannot use spells.",
    };
  }

  if (ability.actionType === "action" && !canUseAction(casterConditions)) {
    return {
      success: false,
      abilityId: ability.id,
      reason: "Caster cannot use an action.",
    };
  }

  if (
    ability.actionType === "bonus-action" &&
    !canUseBonusAction(casterConditions)
  ) {
    return {
      success: false,
      abilityId: ability.id,
      reason: "Caster cannot use a bonus action.",
    };
  }

  if (ability.actionType === "reaction" && !canUseReaction(casterConditions)) {
    return {
      success: false,
      abilityId: ability.id,
      reason: "Caster cannot use a reaction.",
    };
  }

  if (ability.resourceCost?.spellSlotLevel !== undefined) {
    const { spellSlotLevel, amount } = ability.resourceCost;

    if (!hasSpellSlot(resources, spellSlotLevel, amount)) {
      return {
        success: false,
        abilityId: ability.id,
        reason: `Not enough level ${spellSlotLevel} spell slots.`,
      };
    }
  }

  const targetValidation = validateAbilityTarget(
    ability,
    casterId,
    target,
    combatState,
  );

  if (!targetValidation.valid) {
    return {
      success: false,
      abilityId: ability.id,
      reason: targetValidation.reason,
    };
  }

  const updatedState = useAbility(ability, state);

  let updatedResources = resources;

  if (ability.resourceCost?.spellSlotLevel !== undefined) {
    const { spellSlotLevel, amount } = ability.resourceCost;

    updatedResources = consumeSpellSlot(resources, spellSlotLevel, amount);
  }

  let attackResult;

  if (ability.attackType) {
    const damageEffect = ability.effects.find(
      (effect) => effect.type === "damage",
    );

    if (!damageEffect?.damage) {
      return {
        success: false,
        abilityId: ability.id,
        reason: "Attack ability requires a damage effect.",
      };
    }

    const distance = combatEngine.getDistanceBetween(casterId, target.id) ?? 0;

    const attackRequest: CombatAttackRequest = {
      attackerId: casterId,
      defenderId: target.id,
      type: ability.attackType,
      distance,
      target: "body",
      damage: damageEffect.damage,
      attackerConditions: casterConditions,
      defenderConditions,
    };

    attackResult = combatEngine.attack(attackRequest);

    if (!attackResult.success) {
      return {
        success: false,
        abilityId: ability.id,
        reason: "Attack could not be executed.",
      };
    }
  } else {
    executeAbilityEffects(
      ability.effects,
      {
        casterId,
        targetId: target.id,
      },
      combatEngine,
    );
  }

  return {
    success: true,
    abilityId: ability.id,
    abilityState: updatedState,
    resources: updatedResources,
    attackResult,
  };
}
