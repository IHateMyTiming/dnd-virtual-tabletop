import { describe, expect, it } from "vitest";
import { createCombatState, getCurrentCombatant } from "./CombatState";
import type { Combatant } from "./Combatant";

const ranger: Combatant = {
  id: "ranger-1",
  name: "Ranger",

  stats: {
    strength: 10,
    dexterity: 16,
    constitution: 13,
    intelligence: 12,
    wisdom: 14,
    charisma: 8,
  },

  hp: 21,
  maxHp: 21,
  initiative: 10,
  armor: 2,

  position: {
    x: 3,
    y: 6,
  },
  movement: 6,
  movementRemaining: 6,
  actionAvailable: true,
  bonusActionAvailable: true,
  reactionAvailable: true,

  alive: true,
};

const goblin: Combatant = {
  id: "goblin-1",
  name: "Goblin",

  stats: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  },

  hp: 10,
  maxHp: 10,
  initiative: 10,
  armor: 2,

  position: {
    x: 11,
    y: 6,
  },
  movement: 6,
  movementRemaining: 6,
  actionAvailable: true,
  bonusActionAvailable: true,
  reactionAvailable: true,

  alive: true,
};

describe("CombatState", () => {
  it("creates a combat state", () => {
    const state = createCombatState([ranger, goblin]);

    expect(state.combatants).toHaveLength(2);
    expect(state.round).toBe(1);
    expect(state.currentTurnIndex).toBe(0);
  });

  it("starts with the first combatant's turn", () => {
    const state = createCombatState([ranger, goblin]);

    const current = getCurrentCombatant(state);

    expect(current).toBe(ranger);
  });

  it("starts each combatant with their actions available", () => {
    const state = createCombatState([ranger, goblin]);

    for (const combatant of state.combatants) {
      expect(combatant.actionAvailable).toBe(true);

      expect(combatant.bonusActionAvailable).toBe(true);

      expect(combatant.reactionAvailable).toBe(true);
    }
  });

  it("orders combatants by highest dexterity", () => {
    const slow: Combatant = {
      ...ranger,
      id: "slow",
      stats: {
        ...ranger.stats,
        dexterity: 10,
      },
      initiative: 20,
    };

    const fast: Combatant = {
      ...goblin,
      id: "fast",
      stats: {
        ...goblin.stats,
        dexterity: 16,
      },
      initiative: 1,
    };

    const state = createCombatState([slow, fast]);

    expect(state.combatants[0]).toBe(fast);
    expect(state.combatants[1]).toBe(slow);
  });

  it("uses initiative when dexterity is tied", () => {
    const first: Combatant = {
      ...ranger,
      id: "first",
      stats: {
        ...ranger.stats,
        dexterity: 14,
      },
      initiative: 5,
    };

    const second: Combatant = {
      ...goblin,
      id: "second",
      stats: {
        ...goblin.stats,
        dexterity: 14,
      },
      initiative: 10,
    };

    const state = createCombatState([first, second]);

    expect(state.combatants[0]).toBe(second);
    expect(state.combatants[1]).toBe(first);
  });
});
