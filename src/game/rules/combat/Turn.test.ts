import { describe, expect, it } from "vitest";
import { startTurn, endTurn, getCurrentCombatant } from "./Turn";
import type { Combatant } from "./Combatant";
import { createCombatState } from "./CombatState";

function createCombatant(id: string, initiative: number): Combatant {
  return {
    id,
    name: id,
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
    actionAvailable: false,
    bonusActionAvailable: false,
    reactionAvailable: false,
    alive: true,
    initiative,
  };
}

describe("Turn", () => {
  it("starts a turn with all resources available", () => {
    const combatants = [
      createCombatant("ranger", 10),
      createCombatant("goblin", 5),
    ];
    const state = createCombatState(combatants);
    const newState = startTurn(state);

    const current = getCurrentCombatant(newState);

    expect(current?.actionAvailable).toBe(true);
    expect(current?.bonusActionAvailable).toBe(true);
    expect(current?.reactionAvailable).toBe(true);
  });

  it("moves to the next combatant when the turn ends", () => {
    const combatants = [
      createCombatant("ranger", 10),
      createCombatant("goblin", 5),
    ];
    const state = createCombatState(combatants);

    const newState = endTurn(state);

    expect(newState.currentTurnIndex).toBe(1);
    expect(newState.round).toBe(1);
    expect(getCurrentCombatant(newState)?.id).toBe("goblin");
  });

  it("starts a new round after the last combatant", () => {
    const combatants = [
      createCombatant("ranger", 10),
      createCombatant("goblin", 5),
    ];
    const state = createCombatState(combatants);

    const lastTurnState = {
      ...state,
      currentTurnIndex: 1,
    };

    const newState = endTurn(lastTurnState);

    expect(newState.currentTurnIndex).toBe(0);
    expect(newState.round).toBe(2);
    expect(getCurrentCombatant(newState)?.id).toBe("ranger");
  });
});
