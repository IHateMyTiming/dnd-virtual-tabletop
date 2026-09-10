import Phaser from "phaser";
import { cellSize } from "./scenes/Grid";

import { CombatEngine } from "./rules/combat/CombatEngine";
import { createCombatState } from "./rules/combat/CombatState";
import type { Combatant } from "./rules/combat/Combatant";
import type { CharacterStats } from "./rules/stats/Stats";
import { getDefenseStats } from "./rules/combat/Defense";
import type { ConditionId } from "./rules/condition/Condition";

import {
  resolveAbility,
  type AbilityUseRequest,
} from "./rules/abilities/AbilityResolver";
import type { AbilityDefinition } from "./rules/abilities/Ability";
import { createAbilityState } from "./rules/abilities/AbilityState";
import { createEmptyResources } from "./rules/abilities/Resource";

export class CombatTestScene extends Phaser.Scene {
  private ranger!: Phaser.GameObjects.Arc;
  //private ranger2!: Phaser.GameObjects.Arc;

  private goblin!: Phaser.GameObjects.Arc;

  private combatEngine!: CombatEngine;

  private combatText!: Phaser.GameObjects.Text;

  private rangerHpText!: Phaser.GameObjects.Text;
  private goblinHpText!: Phaser.GameObjects.Text;

  private rangerMovementText!: Phaser.GameObjects.Text;
  private goblinMovementText!: Phaser.GameObjects.Text;

  private rangerDefenseText!: Phaser.GameObjects.Text;
  private goblinDefenseText!: Phaser.GameObjects.Text;
  private rangerPatternText!: Phaser.GameObjects.Text;
  private attributeTargetText!: Phaser.GameObjects.Text;
  private attributeSelectorText!: Phaser.GameObjects.Text;
  private attributeValueText!: Phaser.GameObjects.Text;

  private rangerStatusText!: Phaser.GameObjects.Text;
  private goblinStatusText!: Phaser.GameObjects.Text;

  private turnText!: Phaser.GameObjects.Text;
  private resourcesText!: Phaser.GameObjects.Text;
  private defenseText!: Phaser.GameObjects.Text;

  private conditionTargetText!: Phaser.GameObjects.Text;
  private conditionSelectorText!: Phaser.GameObjects.Text;
  private conditionDurationText!: Phaser.GameObjects.Text;
  private conditionStacksText!: Phaser.GameObjects.Text;
  private conditionValueText!: Phaser.GameObjects.Text;

  private conditionTargetId: "ranger" | "goblin" = "goblin";
  private selectedConditionIndex = 0;
  private conditionDuration = 3;
  private conditionStacks = 1;
  private conditionValue = 2;

  private attributeTargetId: "ranger" | "goblin" = "ranger";
  private selectedAttribute: keyof CharacterStats = "dexterity";

  private readonly conditionIds: ConditionId[] = [
    "stunned",
    "poisoned",
    "slowed",
    "burning",
    "blinded",
    "charmed",
    "cursed",
    "frightened",
    "petrified",
    "sleeping",
    "rooted",
    "suppressed",
    "silenced",
    "freezed",
    "acid",
    "bleeding",
    "marked",
    "armor-penetration",
    "magic-penetration",
    "pulled",
    "pushed",
  ];

  private readonly rangerStats: CharacterStats = {
    strength: 10,
    dexterity: 16,
    constitution: 13,
    intelligence: 12,
    wisdom: 14,
    charisma: 8,
  };

  private readonly goblinStats: CharacterStats = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  };

  constructor() {
    super("CombatTestScene");
  }

  create(): void {
    this.drawGrid();
    this.createCombat();
    this.createCharacters();
    this.createInterface();

    this.updateCharacterPositions();
    this.updateInterface();

    this.setCombatLog([
      "Combat sandbox ready.",
      "",
      "Test combat, abilities and conditions.",
    ]);
  }

  private drawGrid(): void {
    const graphics = this.add.graphics();

    graphics.lineStyle(1, 0x444444, 1);

    const visibleColumns = 15;
    const visibleRows = 15;

    for (let column = 0; column <= visibleColumns; column++) {
      const x = column * cellSize;

      graphics.lineBetween(x, 0, x, visibleRows * cellSize);
    }

    for (let row = 0; row <= visibleRows; row++) {
      const y = row * cellSize;

      graphics.lineBetween(0, y, visibleColumns * cellSize, y);
    }
  }

  private createCombat(): void {
    const ranger: Combatant = {
      id: "ranger",
      name: "Ranger",
      team: "player",

      stats: this.rangerStats,

      hp: 21,
      maxHp: 21,

      armor: 0,
      magicResistance: 0,

      position: {
        x: 3,
        y: 6,
      },

      movement: 6,
      movementRemaining: 6,

      actionAvailable: false,
      bonusActionAvailable: false,
      reactionAvailable: false,

      initiative: 10,

      alive: true,
    };

    //const ranger2: Combatant = {
    //  id: "ranger2",
    //  name: "Ranger2",
    //  team: "player",

    //  stats: this.rangerStats,

    //  hp: 21,
    //  maxHp: 21,

    //  armor: 0,
    //  magicResistance: 0,

    //  position: {
    //    x: 4,
    //    y: 6,
    // },

    //  movement: 6,
    //  movementRemaining: 6,

    //  actionAvailable: false,
    //  bonusActionAvailable: false,
    //  reactionAvailable: false,

    //  initiative: 10,

    //  alive: true,
    // };

    const goblin: Combatant = {
      id: "goblin",
      name: "Goblin",
      team: "enemy",

      stats: this.goblinStats,

      hp: 10,
      maxHp: 10,

      armor: 2,
      magicResistance: 0,

      position: {
        x: 4,
        y: 6,
      },

      movement: 6,
      movementRemaining: 6,

      actionAvailable: false,
      bonusActionAvailable: false,
      reactionAvailable: false,

      initiative: 5,

      alive: true,
    };

    const state = createCombatState([ranger, goblin]);
    //const state = createCombatState([ranger, ranger2, goblin]);

    this.combatEngine = new CombatEngine(state);

    this.combatEngine.startCombat();
  }

  private createCharacters(): void {
    const ranger = this.getCombatant("ranger");
    //const ranger2 = this.getCombatant("ranger2");
    const goblin = this.getCombatant("goblin");

    if (!ranger || !goblin) {
      //if (!ranger || !ranger2 || !goblin) {
      return;
    }

    this.ranger = this.add.circle(
      ranger.position.x * cellSize + cellSize / 2,
      ranger.position.y * cellSize + cellSize / 2,
      16,
      0xff3333,
    );

    //this.ranger2 = this.add.circle(
    //  ranger2.position.x * cellSize + cellSize / 2,
    //  ranger2.position.y * cellSize + cellSize / 2,
    //  16,
    //  0xff3333,
    //);

    this.goblin = this.add.circle(
      goblin.position.x * cellSize + cellSize / 2,
      goblin.position.y * cellSize + cellSize / 2,
      16,
      0x3388ff,
    );

    this.add.text(this.ranger.x - 25, this.ranger.y + 25, "Ranger", {
      fontSize: "16px",
      color: "#ffffff",
    });

    this.add.text(this.goblin.x - 25, this.goblin.y + 25, "Goblin", {
      fontSize: "16px",
      color: "#ffffff",
    });
  }

  private createInterface(): void {
    const panelX = 720;

    this.add.rectangle(panelX, 0, 240, 720, 0x151515).setOrigin(0, 0);

    this.add.text(panelX + 15, 15, "COMBAT DEBUG", {
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold",
    });

    this.rangerHpText = this.add.text(panelX + 15, 50, "", {
      fontSize: "13px",
      color: "#ffffff",
    });
    this.goblinHpText = this.add.text(panelX + 15, 70, "", {
      fontSize: "13px",
      color: "#ffffff",
    });
    this.rangerMovementText = this.add.text(panelX + 15, 90, "", {
      fontSize: "11px",
      color: "#ffffff",
    });
    this.goblinMovementText = this.add.text(panelX + 15, 108, "", {
      fontSize: "11px",
      color: "#ffffff",
    });
    this.rangerDefenseText = this.add.text(panelX + 15, 126, "", {
      fontSize: "9px",
      color: "#ffffff",
    });
    this.goblinDefenseText = this.add.text(panelX + 15, 158, "", {
      fontSize: "9px",
      color: "#ffffff",
    });
    this.rangerPatternText = this.add.text(panelX + 15, 178, "", {
      fontSize: "9px",
      color: "#ffffff",
      wordWrap: { width: 210 },
    });
    this.turnText = this.add.text(panelX + 15, 198, "", {
      fontSize: "11px",
      color: "#ffffff",
    });
    this.resourcesText = this.add.text(panelX + 15, 202, "", {
      fontSize: "10px",
      color: "#ffffff",
      wordWrap: { width: 210 },
    });

    this.rangerStatusText = this.add.text(panelX + 15, 232, "", {
      fontSize: "10px",
      color: "#ff9999",
      wordWrap: { width: 210 },
    });
    this.goblinStatusText = this.add.text(panelX + 15, 268, "", {
      fontSize: "10px",
      color: "#9999ff",
      wordWrap: { width: 210 },
    });

    this.add.text(panelX + 15, 250, "COMBAT", {
      fontSize: "12px",
      color: "#aaaaaa",
      fontStyle: "bold",
    });

    this.createButton(
      panelX + 120,
      275,
      150,
      28,
      "RANGED ATTACK",
      0x8b2020,
      () => this.performRangedAttack(),
    );
    this.createButton(
      panelX + 120,
      307,
      150,
      28,
      "MELEE ATTACK",
      0x7a3030,
      () => this.performMeleeAttack(),
    );
    this.createButton(panelX + 120, 339, 150, 28, "MOVE 3m", 0x285c35, () =>
      this.performMove(),
    );
    this.createButton(panelX + 120, 371, 150, 28, "JUMP 2m", 0x5c4a28, () =>
      this.performJump(),
    );

    this.defenseText = this.add.text(panelX + 15, 380, "", {
      fontSize: "10px",
      color: "#ffcc66",
      wordWrap: { width: 210 },
    });

    this.createButton(panelX + 72, 410, 100, 26, "DODGE", 0x285c35, () =>
      this.chooseDefense("dodge"),
    );

    this.createButton(panelX + 178, 410, 100, 26, "PARRY", 0x5c4a28, () =>
      this.chooseDefense("parry"),
    );

    this.add.text(panelX + 15, 405, "ABILITIES", {
      fontSize: "12px",
      color: "#aaaaaa",
      fontStyle: "bold",
    });
    this.createButton(panelX + 120, 430, 150, 26, "DAMAGE", 0x5a2875, () =>
      this.useDamageAbility(),
    );
    this.createButton(panelX + 120, 460, 150, 26, "HEAL", 0x28605a, () =>
      this.useHealAbility(),
    );
    this.createButton(panelX + 120, 490, 150, 26, "POISON", 0x4d6b28, () =>
      this.usePoisonAbility(),
    );

    this.add.text(panelX + 15, 522, "CONDITION TESTER", {
      fontSize: "12px",
      color: "#aaaaaa",
      fontStyle: "bold",
    });

    this.conditionTargetText = this.add
      .text(panelX + 120, 548, "", {
        fontSize: "10px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 140 },
      })
      .setOrigin(0.5);
    this.add.rectangle(panelX + 120, 548, 150, 27, 0x3d3d3d).setDepth(-1);
    this.conditionTargetText.setInteractive({ useHandCursor: true });
    this.conditionTargetText.on("pointerdown", () =>
      this.toggleConditionTarget(),
    );

    this.conditionSelectorText = this.add
      .text(panelX + 120, 577, "", {
        fontSize: "10px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 140 },
      })
      .setOrigin(0.5);
    this.add.rectangle(panelX + 120, 577, 150, 27, 0x3d3d3d).setDepth(-1);
    this.conditionSelectorText.setInteractive({ useHandCursor: true });
    this.conditionSelectorText.on("pointerdown", () => this.nextCondition());

    this.conditionDurationText = this.add.text(panelX + 15, 606, "", {
      fontSize: "10px",
      color: "#ffffff",
    });
    this.conditionStacksText = this.add.text(panelX + 15, 627, "", {
      fontSize: "10px",
      color: "#ffffff",
    });
    this.conditionValueText = this.add.text(panelX + 15, 648, "", {
      fontSize: "10px",
      color: "#ffffff",
    });

    this.createButton(panelX + 178, 606, 32, 20, "-", 0x444444, () =>
      this.adjustCondition("duration", -1),
    );
    this.createButton(panelX + 220, 606, 32, 20, "+", 0x444444, () =>
      this.adjustCondition("duration", 1),
    );
    this.createButton(panelX + 178, 627, 32, 20, "-", 0x444444, () =>
      this.adjustCondition("stacks", -1),
    );
    this.createButton(panelX + 220, 627, 32, 20, "+", 0x444444, () =>
      this.adjustCondition("stacks", 1),
    );
    this.createButton(panelX + 178, 648, 32, 20, "-", 0x444444, () =>
      this.adjustCondition("value", -1),
    );
    this.createButton(panelX + 220, 648, 32, 20, "+", 0x444444, () =>
      this.adjustCondition("value", 1),
    );

    this.createButton(panelX + 80, 675, 105, 25, "APPLY", 0x754040, () =>
      this.applyCondition(),
    );
    this.createButton(panelX + 195, 675, 105, 25, "REMOVE", 0x555555, () =>
      this.removeSelectedCondition(),
    );
    this.createButton(panelX + 120, 707, 150, 20, "END TURN", 0x444444, () =>
      this.endTurn(),
    );

    this.add.rectangle(15, 500, 690, 75, 0x111111, 0.92).setOrigin(0, 0);

    this.attributeTargetText = this.add
      .text(105, 515, "", {
        fontSize: "10px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 160 },
      })
      .setOrigin(0.5);

    this.attributeSelectorText = this.add
      .text(290, 515, "", {
        fontSize: "10px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 160 },
      })
      .setOrigin(0.5);

    this.attributeValueText = this.add.text(15, 542, "", {
      fontSize: "10px",
      color: "#ffffff",
    });

    this.createButton(105, 555, 150, 20, "TARGET", 0x3d3d3d, () =>
      this.toggleAttributeTarget(),
    );
    this.createButton(290, 555, 150, 20, "ATTRIBUTE", 0x3d3d3d, () =>
      this.nextAttribute(),
    );
    this.createButton(475, 555, 70, 20, "-1", 0x444444, () =>
      this.adjustSelectedAttribute(-1),
    );
    this.createButton(570, 555, 70, 20, "+1", 0x444444, () =>
      this.adjustSelectedAttribute(1),
    );

    this.add.rectangle(15, 590, 690, 120, 0x111111, 0.92).setOrigin(0, 0);
    this.combatText = this.add.text(28, 603, "Ready...", {
      fontSize: "11px",
      color: "#ffffff",
      wordWrap: { width: 660 },
      lineSpacing: 3,
    });

    this.updateConditionControls();
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: number,
    callback: () => void,
  ): void {
    const button = this.add
      .rectangle(x, y, width, height, color)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(x, y, label, {
        fontSize: "10px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    button.on("pointerdown", callback);
  }

  private performRangedAttack(): void {
    const attacker = this.combatEngine.getCurrentCombatant();

    if (!attacker || !attacker.alive) {
      this.setCombatLog(["No valid current combatant."]);
      return;
    }

    //const defenderId = attacker.team === "player" ? "ranger2" : "ranger";
    const defenderId = attacker.team === "player" ? "goblin" : "ranger";

    const distance =
      this.combatEngine.getDistanceBetween(attacker.id, defenderId) ?? 0;

    const attackerConditions = this.combatEngine
      .getState()
      .conditionManager.getConditions(attacker.id);

    const defenderConditions = this.combatEngine
      .getState()
      .conditionManager.getConditions(defenderId);

    const result = this.combatEngine.attack({
      attackerId: attacker.id,
      defenderId,
      attackerConditions,
      defenderConditions,
      type: "ranged",
      distance,
      target: "body",
      damage: {
        count: 1,
        sides: 8,
        type: "physical",
      },
    });

    if (!result.success) {
      this.setCombatLog([
        `${attacker.name} cannot attack.`,
        "",
        "Attack failed.",
      ]);
      return;
    }

    this.showAttackResult(`${attacker.name} RANGED ATTACK`, result, distance);
  }

  private performMeleeAttack(): void {
    const attacker = this.combatEngine.getCurrentCombatant();

    if (!attacker || !attacker.alive) {
      this.setCombatLog(["No valid current combatant."]);
      return;
    }

    const defenderId = attacker.team === "player" ? "goblin" : "ranger";

    const distance =
      this.combatEngine.getDistanceBetween(attacker.id, defenderId) ?? 0;

    if (distance > 1) {
      this.setCombatLog([
        `${attacker.name} cannot use a melee attack.`,
        "",
        `Distance: ${distance.toFixed(1)}m`,
        "Melee range is limited to 1m from the target center.",
      ]);
      return;
    }

    const attackerConditions = this.combatEngine
      .getState()
      .conditionManager.getConditions(attacker.id);

    const defenderConditions = this.combatEngine
      .getState()
      .conditionManager.getConditions(defenderId);

    const result = this.combatEngine.attack({
      attackerId: attacker.id,
      defenderId,
      attackerConditions,
      defenderConditions,
      type: "melee",
      distance,
      target: "body",
      damage: {
        count: 1,
        sides: 8,
        type: "physical",
      },
    });

    if (!result.success) {
      this.setCombatLog([
        `${attacker.name} cannot attack.`,
        "",
        "Attack failed.",
      ]);
      return;
    }

    this.showAttackResult(`${attacker.name} MELEE ATTACK`, result, distance);
  }

  private showAttackResult(title: string, result: any, distance: number): void {
    const attack = result.attack;

    if (!attack) {
      this.setCombatLog([title, "", "No attack result."]);
      return;
    }

    if (!attack.hit) {
      this.setCombatLog([
        title,
        "",
        `Distance: ${distance.toFixed(1)}m`,
        `Hit chance: ${attack.chance.toFixed(1)}%`,
        `Roll: ${attack.roll.toFixed(1)}`,
        "",
        "MISS!",
      ]);

      this.updateInterface();
      return;
    }

    const damage = result.damage;

    if (!damage) {
      this.setCombatLog([
        title,
        "",
        "Attack hit, but no damage result was returned.",
      ]);
      this.updateInterface();
      return;
    }

    const defender = this.getCombatant(result.defenderId);

    this.setCombatLog([
      title,
      "",
      `Distance: ${distance.toFixed(1)}m`,
      `Hit chance: ${attack.chance.toFixed(1)}%`,
      `Roll: ${attack.roll.toFixed(1)}`,
      "",
      "HIT!",
      "",
      `Incoming damage: ${damage.rawDamage}`,
      "",
      `Defender: ${defender?.name ?? result.defenderId}`,
      "Choose DODGE or PARRY.",
      defender
        ? `Dodge: ${getDefenseStats(defender.stats).physicalDodge}% | Parry: ${getDefenseStats(defender.stats).parry}%`
        : "",
    ]);

    this.updateInterface();
  }

  private chooseDefense(choice: "dodge" | "parry"): void {
    const result = this.combatEngine.resolveDefense(choice);

    if (!result.success) {
      this.setCombatLog([
        "Defense failed.",
        "",
        choice === "parry"
          ? "Parry requires an available Reaction."
          : "There is no pending attack to defend against.",
      ]);
      this.updateInterface();
      return;
    }

    const defender = this.getCombatant(result.defenderId);
    const damage = result.damage;

    this.setCombatLog([
      `${defender?.name ?? result.defenderId} defends`,
      "",
      result.dodged
        ? "DODGE — attack avoided!"
        : result.parried
          ? "PARRY — damage reduced!"
          : "NO DEFENSE",
      "",
      `Incoming damage: ${damage?.rawDamage ?? 0}`,
      result.parried ? "Parry reduction: applied" : "",
      `Final damage: ${damage?.finalDamage ?? 0}`,
      "",
      `HP: ${result.defenderHpAfter ?? "?"}/${result.defenderHpBefore ?? "?"}`,
      result.defenderHpAfter === 0 ? "" : "",
    ]);

    if (result.defenderHpAfter === 0) {
      this.setCombatLog([
        `${defender?.name ?? result.defenderId} defends`,
        "",
        result.dodged
          ? "DODGE — attack avoided!"
          : result.parried
            ? "PARRY — damage reduced!"
            : "NO DEFENSE",
        "",
        `Final damage: ${damage?.finalDamage ?? 0}`,
        "",
        "💀 TARGET DEFEATED",
      ]);
    }

    this.updateCharacterPositions();
    this.updateInterface();
  }

  private performMove(): void {
    const current = this.combatEngine.getCurrentCombatant();

    if (!current || !current.alive) {
      return;
    }

    const targetId = current.team === "player" ? "goblin" : "ranger";
    const target = this.getCombatant(targetId);

    if (!target) {
      return;
    }

    const direction = Math.sign(current.position.x - target.position.x);

    const newPosition = {
      x: current.position.x + direction * 3,
      y: current.position.y,
    };

    const success = this.combatEngine.move(newPosition, "walk");

    if (!success) {
      this.setCombatLog([
        `${current.name} cannot move.`,
        "",
        "MOVE FAILED — check console.",
      ]);

      return;
    }

    const combatResult = this.combatEngine.getLastCombatResult();

    // AOO hit — movement is waiting for Dodge/Parry.
    if (combatResult?.status === "awaiting-defense") {
      this.updateInterface();

      this.setCombatLog([
        "ATTACK OF OPPORTUNITY!",
        "",
        `${target.name} attacks ${current.name}.`,
        "",
        "HIT!",
        "",
        `Incoming damage: ${combatResult.damage?.rawDamage ?? 0}`,
        "",
        "Choose DODGE or PARRY.",
      ]);

      return;
    }

    // AOO happened but missed.
    if (combatResult?.status === "resolved") {
      this.updateCharacterPositions();
      this.updateInterface();

      this.setCombatLog([
        "ATTACK OF OPPORTUNITY!",
        "",
        `${target.name} attacks ${current.name}.`,
        "",
        combatResult.attack?.hit ? "HIT!" : "MISS!",
        "",
        combatResult.attack
          ? `Hit chance: ${combatResult.attack.chance.toFixed(1)}%`
          : "",
        combatResult.attack
          ? `Roll: ${combatResult.attack.roll.toFixed(1)}`
          : "",
        "",
        `${current.name} moves 3m.`,
        "",
        `Movement remaining: ${current.movementRemaining}m`,
      ]);

      return;
    }

    // No AOO — normal movement.
    this.updateCharacterPositions();
    this.updateInterface();

    this.setCombatLog([
      `${current.name} moves 3m.`,
      "",
      `Movement remaining: ${current.movementRemaining}m`,
    ]);
  }

  private performJump(): void {
    const current = this.combatEngine.getCurrentCombatant();

    if (!current || !current.alive) {
      return;
    }

    const direction = current.team === "player" ? 1 : -1;

    const newPosition = {
      x: current.position.x + direction * 2,
      y: current.position.y,
    };

    const success = this.combatEngine.move(newPosition, "jump");

    if (!success) {
      this.setCombatLog([
        `${current.name} cannot jump.`,
        "",
        "Not enough movement or movement is restricted.",
      ]);
      return;
    }

    this.updateCharacterPositions();
    this.updateInterface();

    this.setCombatLog([
      `${current.name} jumps 2m.`,
      "",
      "Jump does not trigger normal Attack of Opportunity.",
      "",
      `Movement remaining: ${
        this.combatEngine.getCurrentCombatant()?.movementRemaining
      }m`,
    ]);
  }

  private useDamageAbility(): void {
    const caster = this.combatEngine.getCurrentCombatant();

    if (!caster || !caster.alive) {
      return;
    }

    const targetId = caster.team === "player" ? "goblin" : "ranger";

    const ability: AbilityDefinition = {
      id: "debug-magic-damage",
      nameKey: "debug_magic_damage",
      descriptionKey: "debug_magic_damage_description",
      actionType: "action",
      targetType: "enemy",
      attackType: "spell",
      range: 50,
      isSpell: true,

      effects: [
        {
          type: "damage",
          damage: {
            count: 1,
            sides: 4,
            type: "magic",
          },
        },
      ],

      recovery: "unlimited",
    };

    const result = this.resolveTestAbility(ability, caster.id, targetId);

    if (!result.success) {
      this.setCombatLog([
        "Ability failed.",
        "",
        result.reason ?? "Unknown error.",
      ]);
      return;
    }

    const target = this.getCombatant(targetId);
    const attack = result.attackResult?.attack;

    if (!attack) {
      this.setCombatLog([
        `${caster.name} uses MAGIC DAMAGE`,
        "",
        `Target: ${target?.name ?? targetId}`,
        "",
        "No attack result.",
      ]);
      this.updateInterface();
      return;
    }

    if (!attack.hit) {
      this.setCombatLog([
        `${caster.name} uses MAGIC DAMAGE`,
        "",
        `Target: ${target?.name ?? targetId}`,
        "",
        `Hit chance: ${attack.chance.toFixed(1)}%`,
        `Roll: ${attack.roll.toFixed(1)}`,
        "",
        "MISS!",
      ]);
      this.updateInterface();
      return;
    }

    const damage = result.attackResult?.damage;

    this.setCombatLog([
      `${caster.name} uses MAGIC DAMAGE`,
      "",
      `Target: ${target?.name ?? targetId}`,
      "",
      `Spell hit chance: ${attack.chance.toFixed(1)}%`,
      `Roll: ${attack.roll.toFixed(1)}`,
      "",
      "HIT!",
      "",
      `Incoming magic damage: ${damage?.rawDamage ?? 0}`,
      "",
      "Choose DODGE or PARRY.",
      target
        ? `Spell Dodge: ${getDefenseStats(target.stats).spellDodge}% | Parry: ${getDefenseStats(target.stats).parry}%`
        : "",
    ]);

    this.updateInterface();
  }

  private useHealAbility(): void {
    const caster = this.combatEngine.getCurrentCombatant();

    if (!caster || !caster.alive) {
      return;
    }

    const ability: AbilityDefinition = {
      id: "debug-heal",
      nameKey: "debug_heal",
      descriptionKey: "debug_heal_description",
      actionType: "action",
      targetType: "ally",
      range: 50,
      isSpell: true,

      effects: [
        {
          type: "heal",
          value: 5,
        },
      ],

      recovery: "unlimited",
    };

    const result = this.resolveTestAbility(ability, caster.id, caster.id);

    if (!result.success) {
      this.setCombatLog([
        "Heal failed.",
        "",
        result.reason ?? "Unknown error.",
      ]);
      return;
    }

    this.updateInterface();

    const updatedCaster = this.getCombatant(caster.id);

    this.setCombatLog([
      `${caster.name} uses HEAL`,
      "",
      `HP: ${updatedCaster?.hp ?? "?"}/${updatedCaster?.maxHp ?? "?"}`,
    ]);
  }

  private usePoisonAbility(): void {
    const caster = this.combatEngine.getCurrentCombatant();

    if (!caster || !caster.alive) {
      return;
    }

    const targetId = caster.team === "player" ? "goblin" : "ranger";

    const ability: AbilityDefinition = {
      id: "debug-poison",
      nameKey: "debug_poison",
      descriptionKey: "debug_poison_description",
      actionType: "action",
      attackType: "spell",
      targetType: "enemy",
      range: 50,
      isSpell: true,

      effects: [
        {
          type: "apply-condition",
          conditionId: "poisoned",
          duration: 3,
          stacks: 1,
          value: 2,
        },
      ],

      recovery: "unlimited",
    };

    const result = this.resolveTestAbility(ability, caster.id, targetId);

    if (!result.success) {
      this.setCombatLog([
        "Poison failed.",
        "",
        result.reason ?? "Unknown error.",
      ]);
      return;
    }

    this.updateInterface();

    this.setCombatLog([
      `${caster.name} applies POISON`,
      "",
      `Target: ${this.getCombatant(targetId)?.name}`,
      "",
      "Poisoned",
      "Duration: 3 rounds",
      "Damage: 2 per stack",
    ]);
  }

  private resolveTestAbility(
    ability: AbilityDefinition,
    casterId: string,
    targetId: string,
  ) {
    const combatState = this.combatEngine.getState();

    const request: AbilityUseRequest = {
      ability,

      state: createAbilityState(ability.id),

      resources: createEmptyResources(),

      casterId,

      target: {
        id: targetId,
      },

      combatState,

      combatEngine: this.combatEngine,
    };

    return resolveAbility(request);
  }

  private nextCondition(): void {
    this.selectedConditionIndex =
      (this.selectedConditionIndex + 1) % this.conditionIds.length;
    this.updateConditionControls();
    this.setCombatLog([
      `Selected condition: ${this.getSelectedConditionId()}`,
      "",
      "Click the condition selector again to cycle.",
    ]);
  }

  private getSelectedConditionId(): ConditionId {
    return this.conditionIds[this.selectedConditionIndex];
  }

  private adjustCondition(
    field: "duration" | "stacks" | "value",
    amount: number,
  ): void {
    if (field === "duration")
      this.conditionDuration = Math.max(1, this.conditionDuration + amount);
    if (field === "stacks")
      this.conditionStacks = Math.max(1, this.conditionStacks + amount);
    if (field === "value")
      this.conditionValue = Math.max(0, this.conditionValue + amount);
    this.updateConditionControls();
  }

  private toggleConditionTarget(): void {
    this.conditionTargetId =
      this.conditionTargetId === "goblin" ? "ranger" : "goblin";
    this.updateConditionControls();
    this.setCombatLog([
      `Condition target: ${this.getCombatant(this.conditionTargetId)?.name ?? this.conditionTargetId}`,
      "",
      "Click the target selector to switch between Ranger and Goblin.",
    ]);
  }

  private updateConditionControls(): void {
    const conditionId = this.getSelectedConditionId();
    const target = this.getCombatant(this.conditionTargetId);

    this.conditionTargetText?.setText(
      `Target: ${target?.name ?? this.conditionTargetId}`,
    );
    this.conditionSelectorText?.setText(`Condition: ${conditionId}`);
    this.conditionDurationText?.setText(`Duration: ${this.conditionDuration}`);
    this.conditionStacksText?.setText(`Stacks: ${this.conditionStacks}`);
    this.conditionValueText?.setText(`Value: ${this.conditionValue}`);
  }

  private applyCondition(): void {
    const caster = this.combatEngine.getCurrentCombatant();
    if (!caster || !caster.alive) return;

    const targetId = this.conditionTargetId;
    const conditionId = this.getSelectedConditionId();

    const result = this.combatEngine.applyCondition(
      targetId,
      conditionId,
      this.conditionDuration,
      this.conditionStacks,
      this.conditionValue,
      caster.id,
    );

    this.updateCharacterPositions();
    this.updateInterface();

    this.updateInterface();

    if (!result) {
      this.setCombatLog([
        `Could not apply ${conditionId}.`,
        "",
        "Condition was resisted or could not be applied.",
      ]);
      return;
    }

    this.setCombatLog([
      `${this.getCombatant(targetId)?.name} gains ${conditionId}.`,
      "",
      `Duration: ${this.conditionDuration} rounds`,
      `Stacks: ${this.conditionStacks}`,
      `Value: ${this.conditionValue}`,
    ]);
  }

  private removeSelectedCondition(): void {
    const targetId = this.conditionTargetId;
    const target = this.getCombatant(targetId);
    const conditionId = this.getSelectedConditionId();

    if (!target) return;

    this.combatEngine.removeCondition(target.id, conditionId);
    this.updateInterface();
    this.setCombatLog([`Removed ${conditionId} from ${target.name}.`]);
  }

  private endTurn(): void {
    const current = this.combatEngine.getCurrentCombatant();

    if (!current) {
      return;
    }

    this.combatEngine.endTurn();

    const next = this.combatEngine.getCurrentCombatant();

    this.updateInterface();

    this.setCombatLog([
      `${current.name} ended their turn.`,
      "",
      `Now acting: ${next?.name ?? "-"}`,
      "",
      `Round: ${this.combatEngine.getState().round}`,
    ]);
  }

  private updateInterface(): void {
    this.rangerHpText.setText(this.getRangerHpText());

    this.goblinHpText.setText(this.getGoblinHpText());

    this.rangerMovementText.setText(this.getRangerMovementText());

    this.goblinMovementText.setText(this.getGoblinMovementText());
    this.rangerDefenseText.setText(this.getRangerDefenseText());
    this.goblinDefenseText.setText(this.getGoblinDefenseText());
    this.rangerPatternText.setText(this.getRangerPatternText());

    this.turnText.setText(this.getTurnText());

    this.resourcesText.setText(this.getActionResourceText());
    this.defenseText.setText(this.getDefensePromptText());

    this.rangerStatusText.setText(this.getConditionText("ranger"));

    this.goblinStatusText.setText(this.getConditionText("goblin"));
    this.updateConditionControls();
  }

  private getRangerPatternText(): string {
    const ranger = this.getCombatant("ranger");

    if (!ranger) {
      return "Ranger Pattern: ?";
    }

    const state = this.combatEngine.getState();
    const knowledge = state.patternKnowledge.ranger?.find(
      (pattern) => pattern.targetId === "goblin",
    );

    if (!knowledge) {
      return "Ranger → Goblin Pattern: 0/5 (0%)";
    }

    return `Ranger → Goblin Pattern: ${knowledge.attacksObserved}/5 (${knowledge.bonus}%)`;
  }

  private getRangerHpText(): string {
    const ranger = this.getCombatant("ranger");

    if (!ranger) {
      return "Ranger HP: ?";
    }

    return `Ranger HP: ${ranger.hp}/${ranger.maxHp}`;
  }

  private getGoblinHpText(): string {
    const goblin = this.getCombatant("goblin");

    if (!goblin) {
      return "Goblin HP: ?";
    }

    return `Goblin HP: ${goblin.hp}/${goblin.maxHp}`;
  }

  private getRangerMovementText(): string {
    const ranger = this.getCombatant("ranger");

    if (!ranger) {
      return "Ranger Move: ?";
    }

    return `Ranger Move: ${ranger.movementRemaining}/${ranger.movement}m`;
  }

  private getGoblinMovementText(): string {
    const goblin = this.getCombatant("goblin");

    if (!goblin) {
      return "Goblin Move: ?";
    }

    return `Goblin Move: ${goblin.movementRemaining}/${goblin.movement}m`;
  }

  private getRangerDefenseText(): string {
    const ranger = this.getCombatant("ranger");

    if (!ranger) {
      return "Ranger Dodge: ?";
    }

    const defense = getDefenseStats(ranger.stats);
    return `Ranger Dodge: ${defense.physicalDodge}% | Spell: ${defense.spellDodge}%\nParry: ${defense.parry}% | Effect Res: ${defense.effectResistance}% | Mental Res: ${defense.mentalResistance}%`;
  }

  private getGoblinDefenseText(): string {
    const goblin = this.getCombatant("goblin");

    if (!goblin) {
      return "Goblin Dodge: ?";
    }

    const defense = getDefenseStats(goblin.stats);
    return `Goblin Dodge: ${defense.physicalDodge}% | Spell: ${defense.spellDodge}%\nParry: ${defense.parry}% | Effect Res: ${defense.effectResistance}% | Mental Res: ${defense.mentalResistance}%`;
  }

  private toggleAttributeTarget(): void {
    this.attributeTargetId =
      this.attributeTargetId === "ranger" ? "goblin" : "ranger";
    this.updateAttributeControls();
  }

  private nextAttribute(): void {
    const attributes: (keyof CharacterStats)[] = [
      "strength",
      "dexterity",
      "constitution",
      "intelligence",
      "wisdom",
      "charisma",
    ];

    const index = attributes.indexOf(this.selectedAttribute);
    this.selectedAttribute = attributes[(index + 1) % attributes.length];
    this.updateAttributeControls();
  }

  private adjustSelectedAttribute(amount: number): void {
    const combatant = this.getCombatant(this.attributeTargetId);

    if (!combatant) {
      return;
    }

    combatant.stats[this.selectedAttribute] = Math.max(
      1,
      Math.min(18, combatant.stats[this.selectedAttribute] + amount),
    );

    this.updateAttributeControls();
    this.updateInterface();
  }

  private updateAttributeControls(): void {
    const combatant = this.getCombatant(this.attributeTargetId);

    if (!combatant) {
      return;
    }

    this.attributeTargetText?.setText(`Target: ${combatant.name}`);
    this.attributeSelectorText?.setText(`Attribute: ${this.selectedAttribute}`);
    this.attributeValueText?.setText(
      `${combatant.name} ${this.selectedAttribute}: ${combatant.stats[this.selectedAttribute]}`,
    );
  }

  private getTurnText(): string {
    const current = this.combatEngine.getCurrentCombatant();

    if (!current) {
      return "Turn: -";
    }

    const state = this.combatEngine.getState();

    return [`Turn: ${current.name}`, `Round: ${state.round}`].join(" | ");
  }

  private getActionResourceText(): string {
    const current = this.combatEngine.getCurrentCombatant();

    if (!current) {
      return "";
    }

    return [
      `Action: ${current.actionAvailable ? "YES" : "NO"}`,
      `Bonus: ${current.bonusActionAvailable ? "YES" : "NO"}`,
      `Reaction: ${current.reactionAvailable ? "YES" : "NO"}`,
    ].join(" | ");
  }

  private getDefensePromptText(): string {
    const pending = (this.combatEngine as any).pendingDefense as {
      defenderId: string;
    } | null;

    if (!pending) {
      return "";
    }

    const defender = this.getCombatant(pending.defenderId);

    return defender ? `DEFENSE: ${defender.name} — choose Dodge or Parry` : "";
  }

  private getConditionText(combatantId: string): string {
    const combatant = this.getCombatant(combatantId);

    if (!combatant) {
      return "";
    }

    const conditions = this.combatEngine
      .getState()
      .conditionManager.getConditions(combatantId);

    if (conditions.length === 0) {
      return `${combatant.name}: no conditions`;
    }

    const conditionText = conditions
      .map((condition) => {
        const stacks = condition.stacks > 1 ? ` x${condition.stacks}` : "";
        const value =
          condition.value !== undefined ? ` [${condition.value}]` : "";

        const source =
          condition.sourceId !== undefined ? ` <- ${condition.sourceId}` : "";

        return `${condition.id}${stacks} (${condition.duration})${value}${source}`;
      })
      .join(", ");

    return `${combatant.name}: ${conditionText}`;
  }

  private updateCharacterPositions(): void {
    const ranger = this.getCombatant("ranger");

    const goblin = this.getCombatant("goblin");

    if (ranger) {
      this.ranger.setPosition(
        ranger.position.x * cellSize + cellSize / 2,
        ranger.position.y * cellSize + cellSize / 2,
      );
    }

    //if (ranger2) {
    //  this.ranger2.setPosition(
    //    ranger2.position.x * cellSize + cellSize / 2,
    //    ranger2.position.y * cellSize + cellSize / 2,
    //  );
    //}

    if (goblin) {
      this.goblin.setPosition(
        goblin.position.x * cellSize + cellSize / 2,
        goblin.position.y * cellSize + cellSize / 2,
      );
    }
  }

  private getCombatant(id: string): Combatant | undefined {
    return this.combatEngine
      ?.getState()
      .combatants.find((combatant) => combatant.id === id);
  }

  private setCombatLog(lines: string[]): void {
    this.combatText.setText(lines.join("\n"));
  }
}
