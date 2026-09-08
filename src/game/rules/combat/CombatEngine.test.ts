import { describe, expect, it } from "vitest";
import { CombatEngine } from "./CombatEngine";
import { createCombatState } from "./CombatState";
import type { Combatant } from "./Combatant";
import { vi } from "vitest";
import { calculateDistance, calculateMovementCost } from "./Movement";

function createCombatant(
  id: string,
  dexterity: number,
  initiative: number,
): Combatant {
  return {
    id,
    name: id,
    stats: {
      strength: 10,
      dexterity,
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

describe("Movement", () => {
  it("calculates horizontal distance", () => {
    expect(calculateDistance({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(10);
  });

  it("calculates vertical distance", () => {
    expect(calculateDistance({ x: 0, y: 0 }, { x: 0, y: 15 })).toBe(15);
  });

  it("calculates diagonal distance", () => {
    expect(calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it("returns zero for the same position", () => {
    expect(calculateDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it("walking costs one movement per meter", () => {
    expect(calculateMovementCost(5, "walk")).toBe(5);
  });

  it("jumping costs twice the distance", () => {
    expect(calculateMovementCost(5, "jump")).toBe(10);
  });

  it("climbing costs twice the distance", () => {
    expect(calculateMovementCost(3, "climb")).toBe(6);
  });

  it("swimming costs twice the distance", () => {
    expect(calculateMovementCost(4, "swim")).toBe(8);
  });

  it("rejects negative movement distance", () => {
    expect(() => calculateMovementCost(-1, "walk")).toThrow();
  });
});

describe("CombatEngine", () => {
  it("starts combat with the first combatant's resources available", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const state = createCombatState([ranger, goblin]);

    const engine = new CombatEngine(state);

    engine.startCombat();

    const current = engine.getCurrentCombatant();

    expect(current?.id).toBe("ranger");
    expect(current?.actionAvailable).toBe(true);
    expect(current?.bonusActionAvailable).toBe(true);
    expect(current?.reactionAvailable).toBe(true);
  });

  it("moves to the next combatant", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();
    engine.endTurn();

    expect(engine.getCurrentCombatant()?.id).toBe("goblin");

    expect(engine.getState().round).toBe(1);
  });

  it("starts a new round after the last combatant", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    engine.endTurn();
    engine.endTurn();

    expect(engine.getCurrentCombatant()?.id).toBe("ranger");

    expect(engine.getState().round).toBe(2);
  });

  it("consumes an action", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    expect(engine.useAction("action")).toBe(true);

    expect(engine.getCurrentCombatant()?.actionAvailable).toBe(false);
  });

  it("cannot use the same action twice in one turn", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    expect(engine.useAction("action")).toBe(true);

    expect(engine.useAction("action")).toBe(false);
  });

  it("consumes a bonus action", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    expect(engine.useAction("bonus-action")).toBe(true);

    expect(engine.getCurrentCombatant()?.bonusActionAvailable).toBe(false);
  });

  it("consumes a reaction", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    expect(engine.useAction("reaction")).toBe(true);

    expect(engine.getCurrentCombatant()?.reactionAvailable).toBe(false);
  });

  it("restores action resources on the next turn", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    engine.useAction("action");
    engine.useAction("bonus-action");
    engine.useAction("reaction");

    engine.endTurn();

    const current = engine.getCurrentCombatant();

    expect(current?.id).toBe("goblin");
    expect(current?.actionAvailable).toBe(true);
    expect(current?.bonusActionAvailable).toBe(true);
    expect(current?.reactionAvailable).toBe(true);
  });

  it("performs an attack and reduces defender HP", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    ranger.stats.dexterity = 16;

    goblin.armor = 2;
    goblin.hp = 10;
    goblin.maxHp = 10;

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    vi.spyOn(Math, "random").mockReturnValueOnce(0.4).mockReturnValueOnce(0.5);

    const result = engine.attack({
      attackerId: "ranger",
      defenderId: "goblin",
      type: "ranged",
      distance: 25,
      target: "body",
      damage: {
        count: 1,
        sides: 8,
      },
    });

    expect(result.success).toBe(true);
    expect(result.attack?.hit).toBe(true);
    expect(result.defenderHpBefore).toBe(10);
    expect(result.defenderHpAfter).toBeLessThan(10);

    expect(engine.getCurrentCombatant()?.actionAvailable).toBe(false);

    vi.restoreAllMocks();
  });

  it("consumes the action even when the attack misses", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    vi.spyOn(Math, "random").mockReturnValue(0.99);

    const result = engine.attack({
      attackerId: "ranger",
      defenderId: "goblin",
      type: "ranged",
      distance: 25,
      target: "body",
      damage: {
        count: 1,
        sides: 8,
      },
    });

    expect(result.success).toBe(true);
    expect(result.attack?.hit).toBe(false);

    expect(engine.getCurrentCombatant()?.actionAvailable).toBe(false);

    vi.restoreAllMocks();
  });

  it("does not allow a combatant to attack outside their turn", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    engine.endTurn();

    const result = engine.attack({
      attackerId: "ranger",
      defenderId: "goblin",
      type: "ranged",
      distance: 25,
      target: "body",
      damage: {
        count: 1,
        sides: 8,
      },
    });

    expect(result.success).toBe(false);
  });

  it("does not allow a second attack after using the action", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    vi.spyOn(Math, "random").mockReturnValue(0.4);

    const request = {
      attackerId: "ranger",
      defenderId: "goblin",
      type: "ranged" as const,
      distance: 25,
      target: "body" as const,
      damage: {
        count: 1,
        sides: 8,
      },
    };

    expect(engine.attack(request).success).toBe(true);

    expect(engine.attack(request).success).toBe(false);

    vi.restoreAllMocks();
  });

  it("moves the current combatant", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    expect(
      engine.move({
        x: 3,
        y: 4,
      }),
    ).toBe(true);

    expect(engine.getCurrentCombatant()?.position).toEqual({
      x: 3,
      y: 4,
    });
  });

  it("calculates distance between combatants", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    ranger.position = {
      x: 0,
      y: 0,
    };

    goblin.position = {
      x: 3,
      y: 4,
    };

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    expect(engine.getDistanceBetween("ranger", "goblin")).toBe(5);
  });

  it("consumes movement when moving", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    expect(
      engine.move({
        x: 3,
        y: 4,
      }),
    ).toBe(true);

    const current = engine.getCurrentCombatant();

    expect(current?.position).toEqual({
      x: 3,
      y: 4,
    });

    expect(current?.movementRemaining).toBe(1);
  });

  it("jumping consumes twice the distance", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    expect(
      engine.move(
        {
          x: 2,
          y: 0,
        },
        "jump",
      ),
    ).toBe(true);

    expect(engine.getCurrentCombatant()?.movementRemaining).toBe(2);
  });

  it("cannot move farther than remaining movement", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    expect(
      engine.move({
        x: 7,
        y: 0,
      }),
    ).toBe(false);

    expect(engine.getCurrentCombatant()?.position).toEqual({
      x: 0,
      y: 0,
    });

    expect(engine.getCurrentCombatant()?.movementRemaining).toBe(6);
  });

  it("restores movement at the start of the next turn", () => {
    const ranger = createCombatant("ranger", 15, 10);

    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    engine.move({
      x: 5,
      y: 0,
    });

    expect(engine.getCurrentCombatant()?.movementRemaining).toBe(1);

    engine.endTurn();

    expect(engine.getCurrentCombatant()?.movementRemaining).toBe(6);
  });
});

describe("Conditions", () => {
  it("applies a condition to a combatant", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    const condition = engine.applyCondition("goblin", "poisoned", 3, 2);

    expect(condition).toEqual({
      id: "poisoned",
      duration: 3,
      stacks: 2,
    });

    expect(engine.hasCondition("goblin", "poisoned")).toBe(true);
  });

  it("gets conditions from a combatant", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.applyCondition("goblin", "poisoned", 3);
    engine.applyCondition("goblin", "slowed", 2);

    expect(engine.getConditions("goblin")).toHaveLength(2);
  });

  it("removes a condition from a combatant", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.applyCondition("goblin", "stunned", 1);

    expect(engine.removeCondition("goblin", "stunned")).toBe(true);

    expect(engine.hasCondition("goblin", "stunned")).toBe(false);
  });
  it("stunned prevents movement", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.applyCondition("ranger", "stunned", 2);

    expect(engine.move({ x: 4, y: 6 }, "walk")).toBe(false);
  });
  it("rooted prevents movement", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.applyCondition("ranger", "rooted", 2);

    expect(engine.move({ x: 4, y: 6 }, "walk")).toBe(false);
  });
  it("freezed prevents special movement", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.applyCondition("ranger", "freezed", 2);

    expect(engine.move({ x: 4, y: 6 }, "jump")).toBe(false);
  });
  it("freezed still allows normal walking", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.applyCondition("ranger", "freezed", 2);

    expect(engine.move({ x: 3, y: 4 }, "walk")).toBe(true);
  });
  it("processes condition duration when a new round starts", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    engine.applyCondition("ranger", "poisoned", 2);

    engine.endTurn();
    engine.endTurn();

    expect(engine.getState().round).toBe(2);

    expect(engine.getCondition("ranger", "poisoned")?.duration).toBe(1);
  });
  it("applies condition damage at the start of a new round", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    engine.applyCondition("goblin", "bleeding", 2, 3);

    expect(engine.getCurrentCombatant()?.id).toBe("ranger");

    engine.endTurn();
    engine.endTurn();

    expect(engine.getState().round).toBe(2);

    const updatedGoblin = engine
      .getState()
      .combatants.find((combatant) => combatant.id === "goblin");

    expect(updatedGoblin?.hp).toBe(7);
  });
  it("slowed reduces movement at the start of the turn", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.applyCondition("ranger", "slowed", 2);

    engine.startCombat();

    expect(engine.getCurrentCombatant()?.movementRemaining).toBe(3);
  });
  it("freezed reduces movement at the start of the turn", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.applyCondition("ranger", "freezed", 2);

    engine.startCombat();

    expect(engine.getCurrentCombatant()?.movementRemaining).toBe(3);
  });
});
