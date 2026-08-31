import Phaser from "phaser";
import type { Character } from "./Character";

interface CharacterAction {
  type: "add" | "remove" | "move";
  character: Character;
  previousRow?: number;
  previousColumn?: number;
  newRow?: number;
  newColumn?: number;
}

const cellSize = 24;

export class CharacterManager {
  private scene: Phaser.Scene;

  private getLayerGraphics: (layer: number) => Phaser.GameObjects.Graphics;

  private characters: Character[] = [];

  private characterGraphics = new Map<string, Phaser.GameObjects.Graphics>();

  private draggingCharacter: Character | null = null;

  private dragStartRow: number | null = null;
  private dragStartColumn: number | null = null;

  private undoStack: CharacterAction[] = [];
  private redoStack: CharacterAction[] = [];

  constructor(
    scene: Phaser.Scene,
    getLayerGraphics: (layer: number) => Phaser.GameObjects.Graphics,
  ) {
    this.scene = scene;
    this.getLayerGraphics = getLayerGraphics;
  }

  addCharacter(row: number, column: number, layer: number, name = "Character") {
    // Don't allow two characters on the same tile
    if (this.getCharacterAt(row, column, layer)) {
      return null;
    }

    const character: Character = {
      id: crypto.randomUUID(),
      name,
      row,
      column,
      layer,
    };

    this.characters.push(character);

    this.drawCharacter(character);

    this.undoStack.push({
      type: "add",
      character,
    });

    this.redoStack = [];

    return character;
  }

  private drawCharacter(character: Character) {
    const graphics = this.scene.add.graphics();

    this.drawCharacterGraphic(graphics);

    this.characterGraphics.set(character.id, graphics);

    this.updateCharacterPosition(character);

    graphics.setDepth(100);
  }

  private drawCharacterGraphic(graphics: Phaser.GameObjects.Graphics) {
    graphics.clear();

    graphics.fillStyle(0xff0000, 1);

    graphics.fillCircle(0, 0, cellSize * 0.4);

    graphics.lineStyle(2, 0xffffff, 1);

    graphics.strokeCircle(0, 0, cellSize * 0.4);
  }

  updateCharacterPosition(character: Character) {
    const graphics = this.characterGraphics.get(character.id);

    if (!graphics) {
      return;
    }

    const layerGraphics = this.getLayerGraphics(character.layer);

    const scale = layerGraphics.scaleX;

    const x =
      layerGraphics.x +
      character.column * cellSize * scale +
      (cellSize / 2) * scale;

    const y =
      layerGraphics.y +
      character.row * cellSize * scale +
      (cellSize / 2) * scale;

    graphics.setPosition(x, y);
    graphics.setScale(scale);
  }

  updateAllCharacterPositions() {
    for (const character of this.characters) {
      this.updateCharacterPosition(character);
    }
  }

  eraseAt(row: number, column: number, layer: number) {
    const character = this.getCharacterAt(row, column, layer);

    if (!character) {
      return;
    }

    this.removeCharacter(character);
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

    this.dragStartRow = character.row;
    this.dragStartColumn = character.column;
  }

  isDragging() {
    return this.draggingCharacter !== null;
  }

  updateDraggingPosition(row: number, column: number) {
    if (!this.draggingCharacter) {
      return;
    }

    // Don't allow two characters on the same tile
    const existingCharacter = this.getCharacterAt(
      row,
      column,
      this.draggingCharacter.layer,
    );

    if (
      existingCharacter &&
      existingCharacter.id !== this.draggingCharacter.id
    ) {
      return;
    }

    this.draggingCharacter.row = row;
    this.draggingCharacter.column = column;

    this.updateCharacterPosition(this.draggingCharacter);
  }

  stopDragging() {
    if (!this.draggingCharacter) {
      return;
    }

    const character = this.draggingCharacter;

    if (
      this.dragStartRow !== null &&
      this.dragStartColumn !== null &&
      (this.dragStartRow !== character.row ||
        this.dragStartColumn !== character.column)
    ) {
      this.undoStack.push({
        type: "move",
        character,
        previousRow: this.dragStartRow,
        previousColumn: this.dragStartColumn,
        newRow: character.row,
        newColumn: character.column,
      });

      this.redoStack = [];
    }

    this.draggingCharacter = null;
    this.dragStartRow = null;
    this.dragStartColumn = null;
  }

  removeCharacter(character: Character) {
    const index = this.characters.findIndex(
      (currentCharacter) => currentCharacter.id === character.id,
    );

    if (index === -1) {
      return;
    }

    this.characters.splice(index, 1);

    const graphics = this.characterGraphics.get(character.id);

    if (graphics) {
      graphics.destroy();
      this.characterGraphics.delete(character.id);
    }

    this.undoStack.push({
      type: "remove",
      character,
    });

    this.redoStack = [];
  }

  removeAllCharacters() {
    const characters = [...this.characters];

    for (const character of characters) {
      this.removeCharacter(character);
    }
  }

  undo() {
    const action = this.undoStack.pop();

    if (!action) {
      return;
    }

    // Undo ADD
    if (action.type === "add") {
      const index = this.characters.findIndex(
        (character) => character.id === action.character.id,
      );

      if (index !== -1) {
        this.characters.splice(index, 1);
      }

      const graphics = this.characterGraphics.get(action.character.id);

      if (graphics) {
        graphics.destroy();

        this.characterGraphics.delete(action.character.id);
      }
    }

    // Undo REMOVE
    if (action.type === "remove") {
      const exists = this.characters.some(
        (character) => character.id === action.character.id,
      );

      if (!exists) {
        this.characters.push(action.character);
      }

      this.drawCharacter(action.character);
    }

    // Undo MOVE
    if (action.type === "move") {
      action.character.row = action.previousRow!;
      action.character.column = action.previousColumn!;

      this.updateCharacterPosition(action.character);
    }

    this.redoStack.push(action);
  }

  redo() {
    const action = this.redoStack.pop();

    if (!action) {
      return;
    }

    // Redo ADD
    if (action.type === "add") {
      const exists = this.characters.some(
        (character) => character.id === action.character.id,
      );

      if (!exists) {
        this.characters.push(action.character);
      }

      this.drawCharacter(action.character);
    }

    // Redo REMOVE
    if (action.type === "remove") {
      const index = this.characters.findIndex(
        (character) => character.id === action.character.id,
      );

      if (index !== -1) {
        this.characters.splice(index, 1);
      }

      const graphics = this.characterGraphics.get(action.character.id);

      if (graphics) {
        graphics.destroy();

        this.characterGraphics.delete(action.character.id);
      }
    }

    // Redo MOVE
    if (action.type === "move") {
      action.character.row = action.newRow!;
      action.character.column = action.newColumn!;

      this.updateCharacterPosition(action.character);
    }

    this.undoStack.push(action);
  }
}
