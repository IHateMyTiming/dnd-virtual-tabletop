import { describe, expect, it } from "vitest";
import { resolveAbility, type AbilityUseRequest } from "./AbilityResolver";
import {
  createAbilityState,
  isAbilityAvailable,
  useAbility,
} from "./AbilityState";
import type { AbilityDefinition } from "./Ability";
import { createEmptyResources } from "./Resource";
import type { CombatState } from "../combat/CombatState";
import type { Combatant } from "../combat/Combatant";
import { ConditionManager } from "../condition/ConditionManager";

function createCombatant(overrides: Partial<Combatant> = {}): Combatant {
  return {
    id: "character-1",
    name: "Test Character",
    team: "player",
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    hp: 10,
    maxHp: 10,
    armor: 0,
    position: {
      x: 0,
      y: 0,
    },
    movement: 6,
    movementRemaining: 6,
    actionAvailable: true,
    bonusActionAvailable: true,
    reactionAvailable: true,
    initiative: 10,
    alive: true,
    ...overrides,
  };
}

function createCombatState(combatants: Combatant[]): CombatState {
  return {
    combatants,
    round: 1,
    currentTurnIndex: 0,
    conditionManager: new ConditionManager(),
  };
}

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

function createAbilityRequest(
  ability: AbilityDefinition,
  overrides: Partial<AbilityUseRequest> = {},
): AbilityUseRequest {
  const caster = createCombatant({
    id: "character-1",
    team: "player",
  });

  const enemy = createCombatant({
    id: "enemy-1",
    team: "enemy",
  });

  return {
    ability,
    state: createAbilityState(ability.id),
    resources: createEmptyResources(),
    casterId: "character-1",
    target: {
      id: "enemy-1",
    },
    combatState: createCombatState([caster, enemy]),
    ...overrides,
  };
}

describe("AbilityResolver", () => {
  it("successfully resolves a valid ability request", () => {
    const ability = createAbility();

    const result = resolveAbility(createAbilityRequest(ability));

    expect(result.success).toBe(true);
    expect(result.abilityId).toBe("test-ability");
  });

  it("fails when the ability state belongs to another ability", () => {
    const ability = createAbility({
      id: "fireball",
    });

    const state = createAbilityState("different-ability");

    const result = resolveAbility(
      createAbilityRequest(ability, {
        state,
      }),
    );

    expect(result.success).toBe(false);
    expect(result.abilityId).toBe("fireball");
    expect(result.reason).toBe("Ability state does not match ability.");
  });

  it("returns the correct ability id", () => {
    const ability = createAbility({
      id: "test-fireball",
    });

    const result = resolveAbility(createAbilityRequest(ability));

    expect(result.abilityId).toBe("test-fireball");
  });

  it("does not fail for an unlimited ability", () => {
    const ability = createAbility({
      recovery: "unlimited",
    });

    const result = resolveAbility(createAbilityRequest(ability));

    expect(result.success).toBe(true);
  });

  it("fails when a cooldown ability is on cooldown", () => {
    const ability = createAbility({
      recovery: "cooldown",
      cooldown: 8,
    });

    const state = {
      ...createAbilityState(ability.id),
      cooldownRemaining: 4,
    };

    const result = resolveAbility(
      createAbilityRequest(ability, {
        state,
      }),
    );

    expect(result.success).toBe(false);
    expect(result.reason).toBe("Ability is not available.");
  });

  it("fails when a short-rest ability has already been used", () => {
    const ability = createAbility({
      recovery: "short-rest",
    });

    const state = {
      ...createAbilityState(ability.id),
      usedSinceShortRest: true,
    };

    const result = resolveAbility(
      createAbilityRequest(ability, {
        state,
      }),
    );

    expect(result.success).toBe(false);
    expect(result.reason).toBe("Ability is not available.");
  });

  it("fails when a long-rest ability has already been used", () => {
    const ability = createAbility({
      recovery: "long-rest",
    });

    const state = {
      ...createAbilityState(ability.id),
      usedSinceLongRest: true,
    };

    const result = resolveAbility(
      createAbilityRequest(ability, {
        state,
      }),
    );

    expect(result.success).toBe(false);
    expect(result.reason).toBe("Ability is not available.");
  });
  it("starts the cooldown after successfully using a cooldown ability", () => {
    const ability = createAbility({
      recovery: "cooldown",
      cooldown: 8,
    });

    const state = createAbilityState(ability.id);

    const result = resolveAbility(
      createAbilityRequest(ability, {
        state,
      }),
    );

    expect(result.success).toBe(true);
    expect(result.abilityState?.cooldownRemaining).toBe(8);
  });
  it("marks a short-rest ability as used", () => {
    const ability = createAbility({
      recovery: "short-rest",
    });

    const state = createAbilityState(ability.id);

    const result = resolveAbility(
      createAbilityRequest(ability, {
        state,
      }),
    );

    expect(result.success).toBe(true);
    expect(result.abilityState?.usedSinceShortRest).toBe(true);
  });
  it("marks a long-rest ability as used", () => {
    const ability = createAbility({
      recovery: "long-rest",
    });

    const state = createAbilityState(ability.id);

    const result = resolveAbility(
      createAbilityRequest(ability, {
        state,
      }),
    );

    expect(result.success).toBe(true);
    expect(result.abilityState?.usedSinceLongRest).toBe(true);
  });
  it("does not mutate the original ability state", () => {
    const ability = createAbility({
      recovery: "cooldown",
      cooldown: 8,
    });

    const state = createAbilityState(ability.id);

    const result = resolveAbility(
      createAbilityRequest(ability, {
        state,
      }),
    );
    expect(state.cooldownRemaining).toBe(0);
    expect(result.abilityState?.cooldownRemaining).toBe(8);
  });
  it("consumes a spell slot when an ability requires one", () => {
    const ability = createAbility({
      resourceCost: {
        spellSlotLevel: 1,
        amount: 1,
      },
    });

    const resources = {
      ...createEmptyResources(),
      spellSlots: {
        ...createEmptyResources().spellSlots,
        1: 3,
      },
      maxSpellSlots: {
        ...createEmptyResources().maxSpellSlots,
        1: 3,
      },
    };

    const result = resolveAbility(
      createAbilityRequest(ability, {
        resources,
      }),
    );

    expect(result.success).toBe(true);
    expect(result.resources?.spellSlots[1]).toBe(2);
  });
  it("fails when there are not enough spell slots", () => {
    const ability = createAbility({
      resourceCost: {
        spellSlotLevel: 1,
        amount: 1,
      },
    });

    const resources = createEmptyResources();

    const result = resolveAbility(
      createAbilityRequest(ability, {
        resources,
      }),
    );

    expect(result.success).toBe(false);
    expect(result.reason).toBe("Not enough level 1 spell slots.");
  });
  it("does not consume resources when the ability cannot be used", () => {
    const ability = createAbility({
      recovery: "cooldown",
      cooldown: 8,
      resourceCost: {
        spellSlotLevel: 1,
        amount: 1,
      },
    });

    const resources = {
      ...createEmptyResources(),
      spellSlots: {
        ...createEmptyResources().spellSlots,
        1: 3,
      },
      maxSpellSlots: {
        ...createEmptyResources().maxSpellSlots,
        1: 3,
      },
    };

    const state = {
      ...createAbilityState(ability.id),
      cooldownRemaining: 5,
    };

    const result = resolveAbility(
      createAbilityRequest(ability, {
        state,
        resources,
      }),
    );

    expect(result.success).toBe(false);
    expect(result.resources).toBeUndefined();
    expect(resources.spellSlots[1]).toBe(3);
  });
  it("consumes the requested number of spell slots", () => {
    const ability = createAbility({
      resourceCost: {
        spellSlotLevel: 2,
        amount: 2,
      },
    });

    const resources = {
      ...createEmptyResources(),
      spellSlots: {
        ...createEmptyResources().spellSlots,
        2: 3,
      },
      maxSpellSlots: {
        ...createEmptyResources().maxSpellSlots,
        2: 3,
      },
    };

    const caster = createCombatant({
      id: "character-1",
      team: "player",
    });

    const enemy = createCombatant({
      id: "enemy-1",
      team: "enemy",
    });

    const combatState = createCombatState([caster, enemy]);

    const result = resolveAbility({
      ability,
      state: createAbilityState(ability.id),
      resources,
      casterId: "character-1",
      target: {
        id: "enemy-1",
      },
      combatState,
    });

    expect(result.success).toBe(true);
    expect(result.resources?.spellSlots[2]).toBe(1);
  });
  it("fails when the target is out of range", () => {
    const ability = createAbility({
      targetType: "enemy",
      range: 5,
    });

    const caster = createCombatant({
      id: "character-1",
      team: "player",
      position: {
        x: 0,
        y: 0,
      },
    });

    const enemy = createCombatant({
      id: "enemy-1",
      team: "enemy",
      position: {
        x: 10,
        y: 0,
      },
    });

    const combatState = createCombatState([caster, enemy]);

    const result = resolveAbility({
      ability,
      state: createAbilityState(ability.id),
      resources: createEmptyResources(),
      casterId: "character-1",
      target: {
        id: "enemy-1",
      },
      combatState,
    });

    expect(result.success).toBe(false);
    expect(result.reason).toBe("Target is out of range.");
  });
  it("fails when an enemy ability targets an ally", () => {
    const ability = createAbility({
      targetType: "enemy",
    });

    const caster = createCombatant({
      id: "character-1",
      team: "player",
    });

    const ally = createCombatant({
      id: "ally-1",
      team: "player",
    });

    const combatState = createCombatState([caster, ally]);

    const result = resolveAbility({
      ability,
      state: createAbilityState(ability.id),
      resources: createEmptyResources(),
      casterId: "character-1",
      target: {
        id: "ally-1",
      },
      combatState,
    });

    expect(result.success).toBe(false);
    expect(result.reason).toBe("Target is not an enemy.");
  });
});
