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

export interface AbilityUseRequest {
  ability: AbilityDefinition;
  state: AbilityState;
  resources: CharacterResources;
  casterId: string;
  target: AbilityTarget;
  combatState: CombatState;
}

export interface AbilityUseResult {
  success: boolean;
  abilityId: string;
  abilityState?: AbilityState;
  resources?: CharacterResources;
  reason?: string;
}

export function resolveAbility(request: AbilityUseRequest): AbilityUseResult {
  const { ability, state, resources, casterId, target, combatState } = request;

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

  return {
    success: true,
    abilityId: ability.id,
    abilityState: updatedState,
    resources: updatedResources,
  };
}
