import { describe, expect, it } from "vitest";
import {
  createAbilityState,
  isAbilityAvailable,
  useAbility,
  reduceAbilityCooldown,
  restoreAfterShortRest,
  restoreAfterLongRest,
  type AbilityState,
} from "./AbilityState";
import type { AbilityDefinition } from "./Ability";

function createAbility(
  overrides: Partial<AbilityDefinition> = {},
): AbilityDefinition {
  return {
    id: "test-ability",
    nameKey: "ability_test",
    descriptionKey: "ability_test_description",
    actionType: "action",
    targetType: "enemy",
    effects: [],
    recovery: "unlimited",
    ...overrides,
  };
}

describe("AbilityState", () => {
  it("creates an ability in an available state", () => {
    const state = createAbilityState("test-ability");

    expect(state).toEqual({
      abilityId: "test-ability",
      cooldownRemaining: 0,
      usedSinceShortRest: false,
      usedSinceLongRest: false,
    });
  });

  it("keeps an unlimited ability available after use", () => {
    const ability = createAbility({
      recovery: "unlimited",
    });

    const state = createAbilityState(ability.id);
    const updated = useAbility(ability, state);

    expect(isAbilityAvailable(ability, updated)).toBe(true);
    expect(updated.cooldownRemaining).toBe(0);
    expect(updated.usedSinceShortRest).toBe(false);
    expect(updated.usedSinceLongRest).toBe(false);
  });

  it("puts a cooldown ability on cooldown after use", () => {
    const ability = createAbility({
      recovery: "cooldown",
      cooldown: 8,
    });

    const state = createAbilityState(ability.id);
    const updated = useAbility(ability, state);

    expect(updated.cooldownRemaining).toBe(8);
    expect(isAbilityAvailable(ability, updated)).toBe(false);
  });

  it("reduces cooldown by one round", () => {
    const ability = createAbility({
      recovery: "cooldown",
      cooldown: 8,
    });

    const state = useAbility(ability, createAbilityState(ability.id));

    const updated = reduceAbilityCooldown(state);

    expect(updated.cooldownRemaining).toBe(7);
  });

  it("reduces cooldown by the requested amount", () => {
    const state: AbilityState = {
      abilityId: "test-ability",
      cooldownRemaining: 8,
      usedSinceShortRest: false,
      usedSinceLongRest: false,
    };

    const updated = reduceAbilityCooldown(state, 3);

    expect(updated.cooldownRemaining).toBe(5);
  });

  it("does not reduce cooldown below zero", () => {
    const state: AbilityState = {
      abilityId: "test-ability",
      cooldownRemaining: 2,
      usedSinceShortRest: false,
      usedSinceLongRest: false,
    };

    const updated = reduceAbilityCooldown(state, 5);

    expect(updated.cooldownRemaining).toBe(0);
  });

  it("makes a short-rest ability unavailable after use", () => {
    const ability = createAbility({
      recovery: "short-rest",
    });

    const state = createAbilityState(ability.id);
    const updated = useAbility(ability, state);

    expect(updated.usedSinceShortRest).toBe(true);
    expect(isAbilityAvailable(ability, updated)).toBe(false);
  });

  it("restores a short-rest ability after a short rest", () => {
    const ability = createAbility({
      recovery: "short-rest",
    });

    const usedState = useAbility(ability, createAbilityState(ability.id));

    const restoredState = restoreAfterShortRest(usedState);

    expect(restoredState.usedSinceShortRest).toBe(false);
    expect(isAbilityAvailable(ability, restoredState)).toBe(true);
  });

  it("does not restore a long-rest ability after a short rest", () => {
    const ability = createAbility({
      recovery: "long-rest",
    });

    const usedState = useAbility(ability, createAbilityState(ability.id));

    const restoredState = restoreAfterShortRest(usedState);

    expect(restoredState.usedSinceLongRest).toBe(true);
    expect(isAbilityAvailable(ability, restoredState)).toBe(false);
  });

  it("makes a long-rest ability unavailable after use", () => {
    const ability = createAbility({
      recovery: "long-rest",
    });

    const state = createAbilityState(ability.id);
    const updated = useAbility(ability, state);

    expect(updated.usedSinceLongRest).toBe(true);
    expect(isAbilityAvailable(ability, updated)).toBe(false);
  });

  it("restores a long-rest ability after a long rest", () => {
    const ability = createAbility({
      recovery: "long-rest",
    });

    const usedState = useAbility(ability, createAbilityState(ability.id));

    const restoredState = restoreAfterLongRest(usedState);

    expect(restoredState.usedSinceLongRest).toBe(false);
    expect(isAbilityAvailable(ability, restoredState)).toBe(true);
  });

  it("long rest restores cooldowns and short-rest usage", () => {
    const state: AbilityState = {
      abilityId: "test-ability",
      cooldownRemaining: 5,
      usedSinceShortRest: true,
      usedSinceLongRest: true,
    };

    const restoredState = restoreAfterLongRest(state);

    expect(restoredState).toEqual({
      abilityId: "test-ability",
      cooldownRemaining: 0,
      usedSinceShortRest: false,
      usedSinceLongRest: false,
    });
  });

  it("throws when using an unavailable ability", () => {
    const ability = createAbility({
      recovery: "cooldown",
      cooldown: 8,
    });

    const state = useAbility(ability, createAbilityState(ability.id));

    expect(() => useAbility(ability, state)).toThrow(
      'Ability "test-ability" is not available.',
    );
  });

  it("does not mutate the original state", () => {
    const ability = createAbility({
      recovery: "cooldown",
      cooldown: 8,
    });

    const state = createAbilityState(ability.id);
    const updated = useAbility(ability, state);

    expect(state.cooldownRemaining).toBe(0);
    expect(updated.cooldownRemaining).toBe(8);
  });
});
