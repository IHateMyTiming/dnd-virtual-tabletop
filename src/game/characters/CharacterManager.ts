import Phaser from "phaser";
import type { Character } from "./Character";

interface CharacterAction {
  type: "add" | "move" | "remove" | "remove-all";
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

  private selectedCharacter: Character | null = null;

  private draggingCharacter: Character | null = null;

  private undoStack: CharacterAction[] = [];
  private redoStack: CharacterAction[] = [];

  private dragStartRow: number | null = null;
  private dragStartColumn: number | null = null;

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

    this.undoStack.push({
      type: "add",
      character,
    });

    this.redoStack = [];

    return character;
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

    if (this.selectedCharacter?.id === character.id) {
      this.selectedCharacter = null;
    }

    this.undoStack.push({
      type: "remove",
      character,
    });

    this.redoStack = [];
  }

  removeAllCharacters() {
    if (this.characters.length === 0) {
      return;
    }

    const charactersToRemove = [...this.characters];

    for (const character of charactersToRemove) {
      const graphics = this.characterGraphics.get(character.id);

      if (graphics) {
        graphics.destroy();
        this.characterGraphics.delete(character.id);
      }
    }

    this.characters = [];
    this.selectedCharacter = null;

    this.undoStack.push({
      type: "remove-all",
      characters: charactersToRemove,
    });

    this.redoStack = [];
  }

  private drawCharacter(character: Character) {
    const graphics = this.scene.add.graphics();

    this.drawCharacterGraphic(graphics, character);

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

  selectCharacter(character: Character) {
    this.selectedCharacter = character;

    console.log(`Selected character: ${character.name}`);
  }

  startDragging(character: Character) {
    this.draggingCharacter = character;

    this.dragStartRow = character.row;
    this.dragStartColumn = character.column;

    this.selectCharacter(character);
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

  isDragging() {
    return this.draggingCharacter !== null;
  }

  updateDraggingPosition(row: number, column: number) {
    if (!this.draggingCharacter) {
      return;
    }

    this.draggingCharacter.row = row;
    this.draggingCharacter.column = column;

    this.updateCharacterPosition(this.draggingCharacter);
  }

  getSelectedCharacter() {
    return this.selectedCharacter;
  }

  undo() {
    const action = this.undoStack.pop();

    if (!action) {
      return;
    }

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

    if (action.type === "remove") {
      const index = this.characters.findIndex(
        (character) => character.id === action.character.id,
      );

      if (index === -1) {
        this.characters.push(action.character);
      }

      this.drawCharacter(action.character);
    }

    if (action.type === "remove-all") {
      for (const character of action.characters!) {
        this.characters.push(character);
        this.drawCharacter(character);
      }
    }

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

    if (action.type === "add") {
      this.characters.push(action.character);

      this.drawCharacter(action.character);
    }

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

      if (this.selectedCharacter?.id === action.character.id) {
        this.selectedCharacter = null;
      }
    }

    if (action.type === "remove-all") {
      for (const character of action.characters!) {
        const graphics = this.characterGraphics.get(character.id);

        if (graphics) {
          graphics.destroy();
          this.characterGraphics.delete(character.id);
        }
      }

      this.characters = this.characters.filter(
        (character) =>
          !action.characters!.some((removed) => removed.id === character.id),
      );

      this.selectedCharacter = null;
    }

    if (action.type === "move") {
      action.character.row = action.newRow!;
      action.character.column = action.newColumn!;

      this.updateCharacterPosition(action.character);
    }

    this.undoStack.push(action);
  }
}
