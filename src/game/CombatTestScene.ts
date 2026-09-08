import Phaser from "phaser";
import { cellSize } from "./scenes/Grid";
import { CombatEngine } from "./rules/combat/CombatEngine";
import { createCombatState } from "./rules/combat/CombatState";
import type { Combatant } from "./rules/combat/Combatant";
import type { CharacterStats } from "./rules/stats/Stats";

export class CombatTestScene extends Phaser.Scene {
  private ranger!: Phaser.GameObjects.Arc;
  private goblin!: Phaser.GameObjects.Arc;

  private combatEngine!: CombatEngine;

  private combatText!: Phaser.GameObjects.Text;
  private rangerHpText!: Phaser.GameObjects.Text;
  private goblinHpText!: Phaser.GameObjects.Text;

  private rangerMovementText!: Phaser.GameObjects.Text;
  private goblinMovementText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;

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
      stats: this.rangerStats,
      hp: 21,
      maxHp: 21,
      armor: 0,
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

    const goblin: Combatant = {
      id: "goblin",
      name: "Goblin",
      stats: this.goblinStats,
      hp: 10,
      maxHp: 10,
      armor: 2,
      position: {
        x: 11,
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

    this.combatEngine = new CombatEngine(state);

    this.combatEngine.startCombat();
  }

  private createCharacters(): void {
    const ranger = this.combatEngine
      .getState()
      .combatants.find((combatant) => combatant.id === "ranger");

    const goblin = this.combatEngine
      .getState()
      .combatants.find((combatant) => combatant.id === "goblin");

    if (!ranger || !goblin) {
      return;
    }

    this.ranger = this.add.circle(
      ranger.position.x * cellSize + cellSize / 2,
      ranger.position.y * cellSize + cellSize / 2,
      16,
      0xff3333,
    );

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

    this.rangerHpText = this.add.text(panelX + 15, 55, this.getRangerHpText(), {
      fontSize: "14px",
      color: "#ffffff",
    });

    this.goblinHpText = this.add.text(panelX + 15, 80, this.getGoblinHpText(), {
      fontSize: "14px",
      color: "#ffffff",
    });

    this.rangerMovementText = this.add.text(
      panelX + 15,
      105,
      this.getRangerMovementText(),
      {
        fontSize: "13px",
        color: "#ffffff",
      },
    );

    this.goblinMovementText = this.add.text(
      panelX + 15,
      128,
      this.getGoblinMovementText(),
      {
        fontSize: "13px",
        color: "#ffffff",
      },
    );

    this.turnText = this.add.text(panelX + 15, 151, this.getTurnText(), {
      fontSize: "13px",
      color: "#ffffff",
    });

    // ATTACK
    const attackButton = this.add
      .rectangle(panelX + 120, 195, 150, 38, 0x8b2020)
      .setInteractive({
        useHandCursor: true,
      });

    this.add
      .text(panelX + 120, 195, "ATTACK", {
        fontSize: "16px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    attackButton.on("pointerdown", () => {
      this.performAttack();
    });

    // MOVE
    const moveButton = this.add
      .rectangle(panelX + 120, 240, 150, 34, 0x285c35)
      .setInteractive({
        useHandCursor: true,
      });

    this.add
      .text(panelX + 120, 240, "MOVE 3m", {
        fontSize: "15px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    moveButton.on("pointerdown", () => {
      this.performMove();
    });

    // JUMP
    const jumpButton = this.add
      .rectangle(panelX + 120, 281, 150, 34, 0x5c4a28)
      .setInteractive({
        useHandCursor: true,
      });

    this.add
      .text(panelX + 120, 281, "JUMP 2m", {
        fontSize: "15px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    jumpButton.on("pointerdown", () => {
      this.performJump();
    });

    // END TURN
    const endTurnButton = this.add
      .rectangle(panelX + 120, 322, 150, 38, 0x444444)
      .setInteractive({
        useHandCursor: true,
      });

    this.add
      .text(panelX + 120, 322, "END TURN", {
        fontSize: "16px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    endTurnButton.on("pointerdown", () => {
      this.combatEngine.endTurn();

      this.updateInterface();

      const current = this.combatEngine.getCurrentCombatant();

      this.combatText.setText(
        [
          `Current turn: ${current?.name}`,
          "",
          `Round: ${this.combatEngine.getState().round}`,
          "",
          "Ready...",
        ].join("\n"),
      );
    });

    // COMBAT LOG
    this.combatText = this.add.text(panelX + 15, 390, "Ready...", {
      fontSize: "13px",
      color: "#ffffff",
      wordWrap: {
        width: 210,
      },
      lineSpacing: 5,
    });
  }

  private updateInterface(): void {
    this.rangerHpText.setText(this.getRangerHpText());

    this.goblinHpText.setText(this.getGoblinHpText());

    this.rangerMovementText.setText(this.getRangerMovementText());

    this.goblinMovementText.setText(this.getGoblinMovementText());

    this.turnText.setText(this.getTurnText());
  }

  private performAttack(): void {
    const distance =
      this.combatEngine.getDistanceBetween("ranger", "goblin") ?? 0;

    const result = this.combatEngine.attack({
      attackerId: "ranger",
      defenderId: "goblin",
      type: "ranged",
      distance,
      target: "body",
      damage: {
        count: 1,
        sides: 8,
      },
    });

    if (!result.success) {
      this.combatText.setText("Attack failed.");

      return;
    }

    const attack = result.attack;

    if (!attack) {
      return;
    }

    if (!attack.hit) {
      this.combatText.setText(
        [
          "Ranger attacks Goblin",
          "",
          `Distance: ${distance.toFixed(1)}m`,
          `Hit chance: ${attack.chance.toFixed(1)}%`,
          `Roll: ${attack.roll.toFixed(1)}`,
          "",
          "MISS!",
        ].join("\n"),
      );

      this.updateInterface();

      return;
    }

    const damage = attack.damage;

    if (!damage) {
      return;
    }

    this.combatText.setText(
      [
        "Ranger attacks Goblin",
        "",
        `Distance: ${distance.toFixed(1)}m`,
        `Hit chance: ${attack.chance.toFixed(1)}%`,
        `Roll: ${attack.roll.toFixed(1)}`,
        "",
        "HIT!",
        "",
        `Damage roll: ${damage.rawDamage}`,
        `Armor: -${damage.armorReduction}`,
        `Parry: -${damage.parryReduction}`,
        "",
        `FINAL DAMAGE: ${damage.finalDamage}`,
        "",
        `Goblin HP: ${result.defenderHpAfter}/${result.defenderHpBefore}`,
      ].join("\n"),
    );

    this.updateInterface();

    if (result.defenderHpAfter === 0) {
      this.combatText.setText(
        [
          "Ranger attacks Goblin",
          "",
          "HIT!",
          "",
          `FINAL DAMAGE: ${damage.finalDamage}`,
          "",
          "💀 GOBLIN DEFEATED",
        ].join("\n"),
      );
    }
  }

  private getRangerHpText(): string {
    const ranger = this.combatEngine
      .getState()
      .combatants.find((combatant) => combatant.id === "ranger");

    if (!ranger) {
      return "Ranger HP: ?";
    }

    return `Ranger HP: ${ranger.hp}/${ranger.maxHp}`;
  }

  private getGoblinHpText(): string {
    const goblin = this.combatEngine
      .getState()
      .combatants.find((combatant) => combatant.id === "goblin");

    if (!goblin) {
      return "Goblin HP: ?";
    }

    return `Goblin HP: ${goblin.hp}/${goblin.maxHp}`;
  }

  private performMove(): void {
    const current = this.combatEngine.getCurrentCombatant();

    if (!current) {
      return;
    }

    const newPosition = {
      x: current.position.x + 3,
      y: current.position.y,
    };

    const success = this.combatEngine.move(newPosition, "walk");

    if (!success) {
      this.combatText.setText("Not enough movement.");

      return;
    }

    this.updateCharacterPositions();
    this.updateInterface();

    this.combatText.setText(
      [
        `${current.name} moves 3m`,
        "",
        `Movement remaining: ${
          this.combatEngine.getCurrentCombatant()?.movementRemaining
        }m`,
      ].join("\n"),
    );
  }

  private performJump(): void {
    const current = this.combatEngine.getCurrentCombatant();

    if (!current) {
      return;
    }

    const newPosition = {
      x: current.position.x + 2,
      y: current.position.y,
    };

    const success = this.combatEngine.move(newPosition, "jump");

    if (!success) {
      this.combatText.setText("Not enough movement to jump.");

      return;
    }

    this.updateCharacterPositions();
    this.updateInterface();

    this.combatText.setText(
      [
        `${current.name} jumps 2m`,
        "",
        "Movement cost: 4m",
        `Movement remaining: ${
          this.combatEngine.getCurrentCombatant()?.movementRemaining
        }m`,
      ].join("\n"),
    );
  }

  private updateCharacterPositions(): void {
    const ranger = this.combatEngine
      .getState()
      .combatants.find((combatant) => combatant.id === "ranger");

    const goblin = this.combatEngine
      .getState()
      .combatants.find((combatant) => combatant.id === "goblin");

    if (ranger) {
      this.ranger.setPosition(
        ranger.position.x * cellSize + cellSize / 2,
        ranger.position.y * cellSize + cellSize / 2,
      );
    }

    if (goblin) {
      this.goblin.setPosition(
        goblin.position.x * cellSize + cellSize / 2,
        goblin.position.y * cellSize + cellSize / 2,
      );
    }
  }

  private getRangerMovementText(): string {
    const ranger = this.combatEngine
      .getState()
      .combatants.find((combatant) => combatant.id === "ranger");

    if (!ranger) {
      return "Ranger Movement: ?";
    }

    return `Ranger Movement: ${ranger.movementRemaining}/${ranger.movement}m`;
  }

  private getGoblinMovementText(): string {
    const goblin = this.combatEngine
      .getState()
      .combatants.find((combatant) => combatant.id === "goblin");

    if (!goblin) {
      return "Goblin Movement: ?";
    }

    return `Goblin Movement: ${goblin.movementRemaining}/${goblin.movement}m`;
  }

  private getTurnText(): string {
    const current = this.combatEngine.getCurrentCombatant();

    return `Turn: ${current?.name ?? "-"}`;
  }
}
