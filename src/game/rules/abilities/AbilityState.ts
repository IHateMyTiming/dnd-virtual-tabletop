import type { AbilityDefinition } from "./Ability";

export interface AbilityState {
  abilityId: string;
  cooldownRemaining: number;
  usedSinceShortRest: boolean;
  usedSinceLongRest: boolean;
}

export function createAbilityState(abilityId: string): AbilityState {
  return {
    abilityId,
    cooldownRemaining: 0,
    usedSinceShortRest: false,
    usedSinceLongRest: false,
  };
}

export function isAbilityAvailable(
  ability: AbilityDefinition,
  state: AbilityState,
): boolean {
  switch (ability.recovery) {
    case "unlimited":
      return true;

    case "cooldown":
      return state.cooldownRemaining <= 0;

    case "short-rest":
      return !state.usedSinceShortRest;

    case "long-rest":
      return !state.usedSinceLongRest;
  }
}

export function useAbility(
  ability: AbilityDefinition,
  state: AbilityState,
): AbilityState {
  if (!isAbilityAvailable(ability, state)) {
    throw new Error(`Ability "${ability.id}" is not available.`);
  }

  switch (ability.recovery) {
    case "unlimited":
      return { ...state };

    case "cooldown":
      return {
        ...state,
        cooldownRemaining: ability.cooldown ?? 0,
      };

    case "short-rest":
      return {
        ...state,
        usedSinceShortRest: true,
        usedSinceLongRest: true,
      };

    case "long-rest":
      return {
        ...state,
        usedSinceLongRest: true,
      };
  }
}

export function reduceAbilityCooldown(
  state: AbilityState,
  amount = 1,
): AbilityState {
  return {
    ...state,
    cooldownRemaining: Math.max(0, state.cooldownRemaining - amount),
  };
}

export function restoreAfterShortRest(state: AbilityState): AbilityState {
  return {
    ...state,
    usedSinceShortRest: false,
  };
}

export function restoreAfterLongRest(state: AbilityState): AbilityState {
  return {
    ...state,
    cooldownRemaining: 0,
    usedSinceShortRest: false,
    usedSinceLongRest: false,
  };
}
