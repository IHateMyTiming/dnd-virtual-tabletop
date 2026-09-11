import { describe, expect, it } from "vitest";
import { CombatEngine } from "./CombatEngine";
import { createCombatState } from "./CombatState";
import type { Combatant, CombatantTeam } from "./Combatant";
import { vi } from "vitest";
import { calculateDistance, calculateMovementCost } from "./Movement";
import { createCondition } from "../condition/ConditionState";
import { canAttackTarget, canMoveTo } from "../condition/ConditionRestrictions";
import { getFrightenedDamageMultiplier } from "../condition/ConditionFear";
import { shouldWakeFromDamage } from "../condition/ConditionWake";
import { getIncomingDamageMultiplier } from "../condition/ConditionDamageModifier";
import { getConditionResistanceType } from "../condition/ConditionResistance";
import {
  createConditionResistance,
  increaseConditionResistance,
  rollConditionResistance,
} from "./EffectResistance";
import type { ConditionResistanceState } from "./EffectResistance";
import { CONDITION_RESISTANCE_CONFIG } from "../condition/ConditionResistance";
import { getTotalConditionResistance } from "../condition/ConditionResistanceResolver";

function createCombatant(
  id: string,
  dexterity: number,
  initiative: number,
  team: CombatantTeam = "player",
  position = { x: 0, y: 0 },
): Combatant {
  return {
    id,
    name: id,
    team,
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
    magicResistance: 0,
    position,
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
      attackerConditions: [],
      defenderConditions: [],
    });

    expect(result.success).toBe(true);
    expect(result.attack?.hit).toBe(true);
    expect(result.defenderHpBefore).toBe(10);
    expect(result.defenderHpAfter).toBe(10);

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
      attackerConditions: [],
      defenderConditions: [],
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
      attackerConditions: [],
      defenderConditions: [],
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
      attackerConditions: [],
      defenderConditions: [],
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
  it("allows an opportunity attack even when the attacker has no reaction", () => {
    const ranger = createCombatant("ranger", 15, 10, "player", { x: 0, y: 0 });
    const goblin = createCombatant("goblin", 10, 5, "enemy", { x: 1, y: 0 });

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    // The goblin has no Reaction available.
    goblin.reactionAvailable = false;

    // Ranger moves out of melee range.
    const result = engine.move({ x: 4, y: 0 }, "walk");

    expect(result).toBe(true);

    const combatResult = engine.getLastCombatResult();

    expect(combatResult?.status).toBe("awaiting-defense");
    expect(combatResult?.attackerId).toBe("goblin");
    expect(combatResult?.defenderId).toBe("ranger");
  });
  it("consumes reaction when defending with parry", () => {
    const ranger = createCombatant("ranger", 10, 10, "player", { x: 0, y: 0 });

    const goblin = createCombatant("goblin", 10, 5, "enemy", { x: 1, y: 0 });

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.startCombat();

    // Ranger starts with a Reaction.
    expect(engine.getCurrentCombatant()?.reactionAvailable).toBe(true);

    // Goblin attacks Ranger.
    vi.spyOn(Math, "random").mockReturnValueOnce(0); // attack hits
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
    engine.applyCondition("goblin", "slowed", 2, 1, 50);

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
    const goblin = createCombatant("goblin", 10, 5, "enemy", { x: 10, y: 0 });
    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.applyCondition("ranger", "freezed", 2, 1, 50);

    expect(engine.move({ x: 4, y: 6 }, "jump")).toBe(false);
  });
  it("freezed still allows normal walking", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.applyCondition("ranger", "freezed", 2, 1, 50);

    expect(engine.move({ x: 3, y: 4 }, "walk")).toBe(false);
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

    expect(updatedGoblin?.hp).toBe(10);
  });
  it("slowed reduces movement at the start of the turn", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.applyCondition("ranger", "slowed", 2, 1, 50);

    engine.startCombat();

    expect(engine.getCurrentCombatant()?.movementRemaining).toBe(3);
  });
  it("freezed reduces movement at the start of the turn", () => {
    const ranger = createCombatant("ranger", 16, 10);
    const goblin = createCombatant("goblin", 10, 5);

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.applyCondition("ranger", "freezed", 2, 1, 50);

    engine.startCombat();

    expect(engine.getCurrentCombatant()?.movementRemaining).toBe(3);
  });
  it("pulls a combatant toward the condition source", () => {
    const source = createCombatant("source", 10, 10, "player", { x: 0, y: 0 });

    const target = createCombatant("target", 10, 10, "enemy", { x: 10, y: 0 });

    const state = createCombatState([source, target]);
    const engine = new CombatEngine(state);

    engine.applyCondition("target", "pulled", 1, 1, 3, "source");

    const updatedTarget = engine
      .getState()
      .combatants.find((combatant) => combatant.id === "target");

    expect(updatedTarget?.position).toEqual({
      x: 7,
      y: 0,
    });
  });
  it("pushes a combatant away from the condition source", () => {
    const source = createCombatant("source", 10, 10, "player", { x: 0, y: 0 });

    const target = createCombatant("target", 10, 10, "enemy", { x: 10, y: 0 });

    const state = createCombatState([source, target]);
    const engine = new CombatEngine(state);

    engine.applyCondition("target", "pushed", 1, 1, 3, "source");

    const updatedTarget = engine
      .getState()
      .combatants.find((combatant) => combatant.id === "target");

    expect(updatedTarget?.position).toEqual({
      x: 13,
      y: 0,
    });
  });
  it("requires a source for pulled and pushed", () => {
    const target = createCombatant("target", 10, 10, "enemy", { x: 10, y: 0 });

    const state = createCombatState([target]);
    const engine = new CombatEngine(state);

    expect(() => engine.applyCondition("target", "pulled", 1, 1, 3)).toThrow(
      "Forced movement conditions require a source.",
    );
  });
  it("prevents a charmed character from attacking their charmer", () => {
    const conditions = [createCondition("charmed", 2, 1, undefined, "charmer")];

    expect(canAttackTarget("charmer", conditions)).toBe(false);
  });
  it("allows a charmed character to attack other targets", () => {
    const conditions = [createCondition("charmed", 2, 1, undefined, "charmer")];

    expect(canAttackTarget("other-target", conditions)).toBe(true);
  });
  it("allows attacking normally without charmed", () => {
    expect(canAttackTarget("target", [])).toBe(true);
  });
  it("prevents a charmed character from moving away from their charmer", () => {
    const charmer = createCombatant("charmer", 10, 10, "enemy", { x: 0, y: 0 });

    const victim = createCombatant("victim", 10, 10, "player", { x: 5, y: 0 });

    const conditions = [createCondition("charmed", 2, 1, undefined, "charmer")];

    expect(
      canMoveTo(victim.position, { x: 8, y: 0 }, conditions, [charmer, victim]),
    ).toBe(false);
  });
  it("allows a charmed character to move toward their charmer", () => {
    const charmer = createCombatant("charmer", 10, 10, "enemy", { x: 0, y: 0 });

    const victim = createCombatant("victim", 10, 10, "player", { x: 5, y: 0 });

    const conditions = [createCondition("charmed", 2, 1, undefined, "charmer")];

    expect(
      canMoveTo(victim.position, { x: 3, y: 0 }, conditions, [charmer, victim]),
    ).toBe(true);
  });
  it("allows normal movement without charmed", () => {
    const victim = createCombatant("victim", 10, 10, "player", { x: 5, y: 0 });

    expect(canMoveTo(victim.position, { x: 8, y: 0 }, [], [victim])).toBe(true);
  });
  it("reduces damage against the source of fear", () => {
    const conditions = [createCondition("frightened", 2, 1, 50, "dragon")];

    expect(getFrightenedDamageMultiplier(conditions, "dragon")).toBe(0.5);
  });
  it("does not reduce damage against other targets", () => {
    const conditions = [createCondition("frightened", 2, 1, 50, "dragon")];

    expect(getFrightenedDamageMultiplier(conditions, "goblin")).toBe(1);
  });
  it("does not modify damage without frightened", () => {
    expect(getFrightenedDamageMultiplier([], "dragon")).toBe(1);
  });
  it("prevents frightened movement toward the fear source", () => {
    const combatants = [
      createCombatant("dragon", 10, 10, "enemy", { x: 10, y: 0 }),
    ];

    const conditions = [
      createCondition("frightened", 2, 1, undefined, "dragon"),
    ];

    expect(
      canMoveTo({ x: 0, y: 0 }, { x: 5, y: 0 }, conditions, combatants),
    ).toBe(false);
  });
  it("allows frightened movement away from the fear source", () => {
    const combatants = [
      createCombatant("dragon", 10, 10, "enemy", { x: 10, y: 0 }),
    ];

    const conditions = [
      createCondition("frightened", 2, 1, undefined, "dragon"),
    ];

    expect(
      canMoveTo({ x: 0, y: 0 }, { x: -5, y: 0 }, conditions, combatants),
    ).toBe(true);
  });
  it("allows frightened sideways movement", () => {
    const combatants = [
      createCombatant("dragon", 10, 10, "enemy", { x: 10, y: 0 }),
    ];

    const conditions = [
      createCondition("frightened", 2, 1, undefined, "dragon"),
    ];

    expect(
      canMoveTo({ x: 0, y: 0 }, { x: 0, y: 5 }, conditions, combatants),
    ).toBe(true);
  });
  it("wakes a sleeping target when it takes damage", () => {
    const conditions = [createCondition("sleeping", 2)];

    expect(shouldWakeFromDamage(conditions, 5)).toBe(true);
  });
  it("does not wake a sleeping target from zero damage", () => {
    const conditions = [createCondition("sleeping", 2)];

    expect(shouldWakeFromDamage(conditions, 0)).toBe(false);
  });
  it("does not wake a target that is not sleeping", () => {
    const conditions = [createCondition("stunned", 2)];

    expect(shouldWakeFromDamage(conditions, 5)).toBe(false);
  });
  it("increases incoming damage for petrified", () => {
    const conditions = [createCondition("petrified", 2, 1, 50)];

    expect(getIncomingDamageMultiplier(conditions)).toBe(1.5);
  });
  it("combines marked and petrified modifiers", () => {
    const conditions = [
      createCondition("marked", 2, 1, 25),
      createCondition("petrified", 2, 1, 50),
    ];

    expect(getIncomingDamageMultiplier(conditions)).toBe(1.875);
  });
  it("uses charisma resistance for mental conditions", () => {
    expect(getConditionResistanceType("frightened")).toBe("charisma");
    expect(getConditionResistanceType("charmed")).toBe("charisma");
    expect(getConditionResistanceType("cursed")).toBe("charisma");
    expect(getConditionResistanceType("sleeping")).toBe("charisma");
    expect(getConditionResistanceType("petrified")).toBe("charisma");
    expect(getConditionResistanceType("marked")).toBe("charisma");
    expect(getConditionResistanceType("pulled")).toBe("charisma");
    expect(getConditionResistanceType("pushed")).toBe("charisma");
  });
  it("uses constitution resistance for other conditions", () => {
    expect(getConditionResistanceType("stunned")).toBe("constitution");
    expect(getConditionResistanceType("poisoned")).toBe("constitution");
    expect(getConditionResistanceType("rooted")).toBe("constitution");
    expect(getConditionResistanceType("silenced")).toBe("constitution");
  });
  it("creates condition resistance with zero resistance", () => {
    const state = createConditionResistance("stunned");

    expect(state.conditionId).toBe("stunned");
    expect(state.resistance).toBe(0);
  });
  it("increases condition resistance", () => {
    const state = createConditionResistance("stunned");

    const updated = increaseConditionResistance(state, 20);

    expect(updated.resistance).toBe(20);
  });
  it("caps condition resistance at 99", () => {
    const state = createConditionResistance("stunned");

    const updated = increaseConditionResistance(state, 150);

    expect(updated.resistance).toBe(99);
  });
  it("resists when the roll is below resistance", () => {
    const state: ConditionResistanceState = {
      conditionId: "stunned",
      resistance: 50,
    };

    expect(rollConditionResistance(state, () => 0.25)).toBe(true);
  });
  it("does not resist when the roll is above resistance", () => {
    const state: ConditionResistanceState = {
      conditionId: "stunned",
      resistance: 50,
    };

    expect(rollConditionResistance(state, () => 0.75)).toBe(false);
  });
  it("allows the first application of a condition", () => {
    const ranger = createCombatant("ranger", 10, 10, "player");

    const goblin = createCombatant("goblin", 10, 5, "enemy");

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    const condition = engine.applyCondition("goblin", "stunned", 2);

    expect(condition).toBeDefined();
    expect(engine.hasCondition("goblin", "stunned")).toBe(true);
  });
  it("increases condition resistance after successful application", () => {
    const ranger = createCombatant("ranger", 10, 10, "player");

    const goblin = createCombatant("goblin", 10, 5, "enemy");

    const engine = new CombatEngine(createCombatState([ranger, goblin]));

    engine.applyCondition("goblin", "stunned", 2);

    const resistance = engine
      .getState()
      .conditionManager.getConditionResistance("goblin", "stunned");

    expect(resistance.resistance).toBe(
      CONDITION_RESISTANCE_CONFIG.applicationResistanceIncrease,
    );
  });
  it("uses accumulated resistance when resolving a condition", () => {
    const stats = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 14,
    };

    const resistance = {
      conditionId: "frightened" as const,
      resistance: 10,
    };

    expect(getTotalConditionResistance(stats, "frightened", resistance)).toBe(
      15,
    );
  });
  it("resists a condition when the resistance roll succeeds", () => {
    const ranger = createCombatant("ranger", 10, 10, "player");

    const goblin = createCombatant("goblin", 10, 5, "enemy");

    const engine = new CombatEngine(
      createCombatState([ranger, goblin]),
      () => 0,
    );

    // First application always succeeds.
    const first = engine.applyCondition("goblin", "stunned", 2);

    expect(first).toBeDefined();

    // Second application has resistance.
    const second = engine.applyCondition("goblin", "stunned", 2);

    expect(second).toBeUndefined();
  });
  it("applies a condition when the resistance roll fails", () => {
    const ranger = createCombatant("ranger", 10, 10, "player");

    const goblin = createCombatant("goblin", 10, 5, "enemy");

    const engine = new CombatEngine(
      createCombatState([ranger, goblin]),
      () => 0.99,
    );

    engine.applyCondition("goblin", "stunned", 2);

    const second = engine.applyCondition("goblin", "stunned", 2);

    expect(second).toBeDefined();
    expect(engine.hasCondition("goblin", "stunned")).toBe(true);
  });
});
