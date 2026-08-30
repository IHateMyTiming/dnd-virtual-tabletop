import Phaser from "phaser";
import type { Character } from "./Character";

const cellSize = 24;

export class CharacterManager {
  private scene: Phaser.Scene;

  private getLayerGraphics: (layer: number) => Phaser.GameObjects.Graphics;

  private characters: Character[] = [];

  private characterGraphics = new Map<string, Phaser.GameObjects.Graphics>();

  private selectedCharacter: Character | null = null;

  private draggingCharacter: Character | null = null;

  constructor(
    scene: Phaser.Scene,
    getLayerGraphics: (layer: number) => Phaser.GameObjects.Graphics,
  ) {
    this.scene = scene;
    this.getLayerGraphics = getLayerGraphics;
  }

  addCharacter(row: number, column: number, layer: number, name = "Character") {
    const character: Character = {
      id: crypto.randomUUID(),
      name,
      row,
      column,
      layer,
    };

    this.characters.push(character);

    this.drawCharacter(character);

    return character;
  }

  private drawCharacter(character: Character) {
    const graphics = this.scene.add.graphics();

    this.drawCharacterGraphic(graphics, character);

    this.characterGraphics.set(character.id, graphics);

    this.updateCharacterPosition(character);

    graphics.setDepth(100);
  }

  private drawCharacterGraphic(
    graphics: Phaser.GameObjects.Graphics,
    character: Character,
  ) {
    graphics.clear();

    graphics.fillStyle(0xff0000, 1);

    graphics.fillCircle(
      character.column * cellSize + cellSize / 2,
      character.row * cellSize + cellSize / 2,
      cellSize * 0.4,
    );

    graphics.lineStyle(2, 0xffffff, 1);

    graphics.strokeCircle(
      character.column * cellSize + cellSize / 2,
      character.row * cellSize + cellSize / 2,
      cellSize * 0.4,
    );
  }

  updateCharacterPosition(character: Character) {
    const graphics = this.characterGraphics.get(character.id);

    if (!graphics) {
      return;
    }

    const layerGraphics = this.getLayerGraphics(character.layer);

    graphics.setPosition(layerGraphics.x, layerGraphics.y);

    graphics.setScale(layerGraphics.scaleX, layerGraphics.scaleY);
  }

  updateAllCharacterPositions() {
    for (const character of this.characters) {
      this.updateCharacterPosition(character);
    }
  }

  getCharacters() {
    return this.characters;
  }

  getCharacterAt(row: number, column: number, layer: number): Character | null {
    return (
      this.characters.find(
        (character) =>
          character.row === row &&
          character.column === column &&
          character.layer === layer,
      ) ?? null
    );
  }

  startDragging(character: Character) {
    this.draggingCharacter = character;
    this.selectedCharacter = character;

    console.log(`Dragging ${character.name}`);
  }

  isDragging() {
    return this.draggingCharacter !== null;
  }

  updateDraggingPosition(row: number, column: number) {
    if (!this.draggingCharacter) {
      return;
    }

    const character = this.draggingCharacter;

    character.row = row;
    character.column = column;

    const graphics = this.characterGraphics.get(character.id);

    if (!graphics) {
      return;
    }

    this.drawCharacterGraphic(graphics, character);

    // Keep the character attached to its layer
    this.updateCharacterPosition(character);
  }

  stopDragging() {
    if (this.draggingCharacter) {
      console.log(
        `Dropped ${this.draggingCharacter.name} at row ${this.draggingCharacter.row}, column ${this.draggingCharacter.column}`,
      );
    }

    this.draggingCharacter = null;
  }

  getSelectedCharacter() {
    return this.selectedCharacter;
  }
}
