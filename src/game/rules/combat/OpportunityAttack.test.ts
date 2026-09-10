import { describe, expect, it } from "vitest";
import type { Combatant } from "./Combatant";
import { getOpportunityAttackers } from "./OpportunityAttack";

function createCombatant(
  id: string,
  team: "player" | "enemy",
  position: { x: number; y: number },
  reactionAvailable = true,
): Combatant {
  return {
    id,
    name: id,
    team,
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
    position,
    movement: 6,
    movementRemaining: 6,
    actionAvailable: true,
    bonusActionAvailable: true,
    reactionAvailable,
    initiative: 10,
    alive: true,
  };
}

describe("OpportunityAttack", () => {
  it("finds an enemy that can make an opportunity attack", () => {
    const movingCombatant = createCombatant("player", "player", { x: 0, y: 0 });

    const enemy = createCombatant("enemy", "enemy", { x: 1, y: 0 });

    expect(
      getOpportunityAttackers(movingCombatant, { x: 0, y: 0 }, { x: 3, y: 0 }, [
        movingCombatant,
        enemy,
      ]),
    ).toEqual([enemy]);
  });

  it("ignores enemies without a reaction", () => {
    const movingCombatant = createCombatant("player", "player", { x: 0, y: 0 });

    const enemy = createCombatant("enemy", "enemy", { x: 1, y: 0 }, false);

    expect(
      getOpportunityAttackers(movingCombatant, { x: 0, y: 0 }, { x: 3, y: 0 }, [
        movingCombatant,
        enemy,
      ]),
    ).toEqual([]);
  });

  it("ignores allies", () => {
    const movingCombatant = createCombatant("player", "player", { x: 0, y: 0 });

    const ally = createCombatant("ally", "player", { x: 1, y: 0 });

    expect(
      getOpportunityAttackers(movingCombatant, { x: 0, y: 0 }, { x: 3, y: 0 }, [
        movingCombatant,
        ally,
      ]),
    ).toEqual([]);
  });

  it("ignores dead enemies", () => {
    const movingCombatant = createCombatant("player", "player", { x: 0, y: 0 });

    const enemy = createCombatant("enemy", "enemy", { x: 1, y: 0 });

    enemy.alive = false;

    expect(
      getOpportunityAttackers(movingCombatant, { x: 0, y: 0 }, { x: 3, y: 0 }, [
        movingCombatant,
        enemy,
      ]),
    ).toEqual([]);
  });

  it("ignores movement that stays in melee range", () => {
    const movingCombatant = createCombatant("player", "player", { x: 0, y: 0 });

    const enemy = createCombatant("enemy", "enemy", { x: 1, y: 0 });

    expect(
      getOpportunityAttackers(
        movingCombatant,
        { x: 0, y: 0 },
        { x: 0.5, y: 0 },
        [movingCombatant, enemy],
      ),
    ).toEqual([]);
  });
});
