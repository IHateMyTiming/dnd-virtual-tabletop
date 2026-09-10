import { expect, it } from "vitest";
import { resolveAbility, type AbilityUseRequest } from "./AbilityResolver";
import { createAbilityState } from "./AbilityState";
import type { AbilityDefinition } from "./Ability";
import { createEmptyResources } from "./Resource";
import type { CombatState } from "../combat/CombatState";
import type { Combatant } from "../combat/Combatant";
import { ConditionManager } from "../condition/ConditionManager";
import { CombatEngine } from "../combat/CombatEngine";

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
    magicResistance: 0,
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

  const combatState = createCombatState([caster, enemy]);
  const combatEngine = new CombatEngine(combatState, () => 0);

  return {
    ability,
    state: createAbilityState(ability.id),
    resources: createEmptyResources(),
    casterId: "character-1",
    target: {
      id: "enemy-1",
    },
    combatState,
    combatEngine,
    ...overrides,
  };
}
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
  const combatEngine = new CombatEngine(combatState, () => 0);

  const result = resolveAbility({
    ability,
    state: createAbilityState(ability.id),
    resources: createEmptyResources(),
    casterId: "character-1",
    target: {
      id: "ally-1",
    },
    combatState,
    combatEngine,
  });
  expect(result.success).toBe(false);
  expect(result.reason).toBe("Target is not an enemy.");
});
it("executes ability effects when the ability is successfully resolved", () => {
  const ability = createAbility({
    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 1,
          type: "magic",
        },
      },
    ],
  });

  const request = createAbilityRequest(ability);

  const result = resolveAbility(request);

  expect(result.success).toBe(true);

  const enemy = request.combatEngine
    .getState()
    .combatants.find((combatant) => combatant.id === "enemy-1");

  expect(enemy?.hp).toBe(9);
});
