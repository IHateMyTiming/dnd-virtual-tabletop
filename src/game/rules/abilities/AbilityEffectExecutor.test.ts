import { describe, expect, it } from "vitest";
import { executeAbilityEffects } from "./AbilityEffectExecutor";
import type { AbilityEffect } from "./AbilityEffect";
import { CombatEngine } from "../combat/CombatEngine";
import { createCombatState } from "../combat/CombatState";
import type { Combatant } from "../combat/Combatant";

function createCombatant(
  id: string,
  team: "player" | "enemy",
  hp = 20,
  maxHp = 20,
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
    hp,
    maxHp,
    armor: 0,
    magicResistance: 0,
    position: { x: 0, y: 0 },
    movement: 5,
    movementRemaining: 5,
    actionAvailable: true,
    bonusActionAvailable: true,
    reactionAvailable: true,
    initiative: team === "player" ? 10 : 5,
    alive: hp > 0,
  };
}

function createEngine(playerHp = 20, playerMaxHp = 20): CombatEngine {
  const player = createCombatant("player", "player", playerHp, playerMaxHp);

  const enemy = createCombatant("enemy", "enemy");

  return new CombatEngine(createCombatState([player, enemy]), () => 0);
}

describe("AbilityEffectExecutor", () => {
  it("executes a damage effect", () => {
    const engine = createEngine();

    const effects: AbilityEffect[] = [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 1,
          type: "magic",
        },
      },
    ];

    executeAbilityEffects(
      effects,
      {
        casterId: "player",
        targetId: "enemy",
      },
      engine,
    );

    const enemy = engine
      .getState()
      .combatants.find((combatant) => combatant.id === "enemy");

    expect(enemy?.hp).toBe(19);
  });

  it("executes a heal effect", () => {
    const engine = createEngine(10, 20);

    const effects: AbilityEffect[] = [
      {
        type: "heal",
        value: 5,
      },
    ];

    executeAbilityEffects(
      effects,
      {
        casterId: "player",
        targetId: "player",
      },
      engine,
    );

    const player = engine
      .getState()
      .combatants.find((combatant) => combatant.id === "player");

    expect(player?.hp).toBe(15);
  });

  it("does not heal above max HP", () => {
    const engine = createEngine(18, 20);

    const effects: AbilityEffect[] = [
      {
        type: "heal",
        value: 10,
      },
    ];

    executeAbilityEffects(
      effects,
      {
        casterId: "player",
        targetId: "player",
      },
      engine,
    );

    const player = engine
      .getState()
      .combatants.find((combatant) => combatant.id === "player");

    expect(player?.hp).toBe(20);
  });

  it("applies a condition", () => {
    const engine = createEngine();

    const effects: AbilityEffect[] = [
      {
        type: "apply-condition",
        conditionId: "burning",
        duration: 3,
        stacks: 2,
        value: 3,
      },
    ];

    executeAbilityEffects(
      effects,
      {
        casterId: "player",
        targetId: "enemy",
      },
      engine,
    );

    const condition = engine.getCondition("enemy", "burning");

    expect(condition).toBeDefined();
    expect(condition?.duration).toBe(3);
    expect(condition?.stacks).toBe(2);
    expect(condition?.value).toBe(3);
    expect(condition?.sourceId).toBe("player");
  });

  it("removes a condition", () => {
    const engine = createEngine();

    engine.applyCondition("enemy", "burning", 3, 1, 3, "player");

    expect(engine.hasCondition("enemy", "burning")).toBe(true);

    const effects: AbilityEffect[] = [
      {
        type: "remove-condition",
        conditionId: "burning",
      },
    ];

    executeAbilityEffects(
      effects,
      {
        casterId: "player",
        targetId: "enemy",
      },
      engine,
    );

    expect(engine.hasCondition("enemy", "burning")).toBe(false);
  });

  it("executes multiple effects in order", () => {
    const engine = createEngine();

    const effects: AbilityEffect[] = [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 1,
          type: "magic",
        },
      },
      {
        type: "apply-condition",
        conditionId: "burning",
        duration: 2,
        value: 3,
      },
    ];

    executeAbilityEffects(
      effects,
      {
        casterId: "player",
        targetId: "enemy",
      },
      engine,
    );

    const enemy = engine
      .getState()
      .combatants.find((combatant) => combatant.id === "enemy");

    expect(enemy?.hp).toBe(19);
    expect(engine.hasCondition("enemy", "burning")).toBe(true);
  });

  it("throws when a damage effect has no damage", () => {
    const engine = createEngine();

    expect(() =>
      executeAbilityEffects(
        [{ type: "damage" }],
        {
          casterId: "player",
          targetId: "enemy",
        },
        engine,
      ),
    ).toThrow("Damage effect requires damage.");
  });

  it("throws when a heal effect has no value", () => {
    const engine = createEngine();

    expect(() =>
      executeAbilityEffects(
        [{ type: "heal" }],
        {
          casterId: "player",
          targetId: "player",
        },
        engine,
      ),
    ).toThrow("Heal effect requires a value.");
  });

  it("throws when apply-condition has no condition", () => {
    const engine = createEngine();

    expect(() =>
      executeAbilityEffects(
        [{ type: "apply-condition" }],
        {
          casterId: "player",
          targetId: "enemy",
        },
        engine,
      ),
    ).toThrow("Apply-condition effect requires a conditionId.");
  });

  it("throws when remove-condition has no condition", () => {
    const engine = createEngine();

    expect(() =>
      executeAbilityEffects(
        [{ type: "remove-condition" }],
        {
          casterId: "player",
          targetId: "enemy",
        },
        engine,
      ),
    ).toThrow("Remove-condition effect requires a conditionId.");
  });
});
