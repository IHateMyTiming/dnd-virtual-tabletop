import { describe, expect, it } from "vitest";
import { validateAbilityTarget, type AbilityTarget } from "./AbilityTarget";
import type { AbilityDefinition } from "./Ability";
import type { CombatState } from "../combat/CombatState";
import type { Combatant } from "../combat/Combatant";
import { ConditionManager } from "../condition/ConditionManager";

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

describe("AbilityTarget", () => {
  it("accepts a valid enemy target", () => {
    const ability = createAbility({
      targetType: "enemy",
    });

    const caster = createCombatant({
      id: "character-1",
      team: "player",
    });

    const enemy = createCombatant({
      id: "enemy-1",
      team: "enemy",
    });

    const state = createCombatState([caster, enemy]);

    const target: AbilityTarget = {
      id: "enemy-1",
    };

    const result = validateAbilityTarget(ability, "character-1", target, state);

    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("rejects a target without an id", () => {
    const ability = createAbility();

    const caster = createCombatant({
      id: "character-1",
    });

    const state = createCombatState([caster]);

    const target: AbilityTarget = {
      id: "",
    };

    const result = validateAbilityTarget(ability, "character-1", target, state);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Target is invalid.");
  });

  it("accepts an area target", () => {
    const ability = createAbility({
      targetType: "area",
    });

    const caster = createCombatant({
      id: "character-1",
    });

    const state = createCombatState([caster]);

    const target: AbilityTarget = {
      id: "area-1",
    };

    const result = validateAbilityTarget(ability, "character-1", target, state);

    expect(result.valid).toBe(true);
  });

  it("accepts a self target", () => {
    const ability = createAbility({
      targetType: "self",
    });

    const caster = createCombatant({
      id: "character-1",
    });

    const state = createCombatState([caster]);

    const target: AbilityTarget = {
      id: "character-1",
    };

    const result = validateAbilityTarget(ability, "character-1", target, state);

    expect(result.valid).toBe(true);
  });

  it("accepts an ally target", () => {
    const ability = createAbility({
      targetType: "ally",
    });

    const caster = createCombatant({
      id: "character-1",
      team: "player",
    });

    const ally = createCombatant({
      id: "ally-1",
      team: "player",
    });

    const state = createCombatState([caster, ally]);

    const target: AbilityTarget = {
      id: "ally-1",
    };

    const result = validateAbilityTarget(ability, "character-1", target, state);

    expect(result.valid).toBe(true);
  });

  it("accepts the caster as an ally target", () => {
    const ability = createAbility({
      targetType: "ally",
    });

    const caster = createCombatant({
      id: "character-1",
      team: "player",
    });

    const state = createCombatState([caster]);

    const target: AbilityTarget = {
      id: "character-1",
    };

    const result = validateAbilityTarget(ability, "character-1", target, state);

    expect(result.valid).toBe(true);
  });

  it("rejects an enemy as an ally target", () => {
    const ability = createAbility({
      targetType: "ally",
    });

    const caster = createCombatant({
      id: "character-1",
      team: "player",
    });

    const enemy = createCombatant({
      id: "enemy-1",
      team: "enemy",
    });

    const state = createCombatState([caster, enemy]);

    const result = validateAbilityTarget(
      ability,
      "character-1",
      { id: "enemy-1" },
      state,
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Target is not an ally.");
  });

  it("rejects an ally as an enemy target", () => {
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

    const state = createCombatState([caster, ally]);

    const result = validateAbilityTarget(
      ability,
      "character-1",
      { id: "ally-1" },
      state,
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Target is not an enemy.");
  });

  it("rejects a target that does not exist", () => {
    const ability = createAbility();

    const caster = createCombatant({
      id: "character-1",
    });

    const state = createCombatState([caster]);

    const result = validateAbilityTarget(
      ability,
      "character-1",
      { id: "unknown-1" },
      state,
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Target does not exist.");
  });

  it("rejects a dead target", () => {
    const ability = createAbility();

    const caster = createCombatant({
      id: "character-1",
      team: "player",
    });

    const enemy = createCombatant({
      id: "enemy-1",
      team: "enemy",
      hp: 0,
      alive: false,
    });

    const state = createCombatState([caster, enemy]);

    const result = validateAbilityTarget(
      ability,
      "character-1",
      { id: "enemy-1" },
      state,
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Target is not alive.");
  });

  it("rejects an invalid caster", () => {
    const ability = createAbility();

    const enemy = createCombatant({
      id: "enemy-1",
      team: "enemy",
    });

    const state = createCombatState([enemy]);

    const result = validateAbilityTarget(
      ability,
      "missing-caster",
      { id: "enemy-1" },
      state,
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Caster is invalid.");
  });

  it("accepts a target within ability range", () => {
    const ability = createAbility({
      targetType: "enemy",
      range: 10,
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
        x: 6,
        y: 8,
      },
    });

    const state = createCombatState([caster, enemy]);

    const result = validateAbilityTarget(
      ability,
      "character-1",
      { id: "enemy-1" },
      state,
    );

    expect(result.valid).toBe(true);
  });

  it("rejects a target outside ability range", () => {
    const ability = createAbility({
      targetType: "enemy",
      range: 10,
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
        x: 6,
        y: 9,
      },
    });

    const state = createCombatState([caster, enemy]);

    const result = validateAbilityTarget(
      ability,
      "character-1",
      { id: "enemy-1" },
      state,
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Target is out of range.");
  });

  it("does not apply range validation when an ability has no range", () => {
    const ability = createAbility({
      targetType: "enemy",
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
        x: 100,
        y: 100,
      },
    });

    const state = createCombatState([caster, enemy]);

    const result = validateAbilityTarget(
      ability,
      "character-1",
      { id: "enemy-1" },
      state,
    );

    expect(result.valid).toBe(true);
  });
});
