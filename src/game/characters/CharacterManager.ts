import Phaser from "phaser";
import type {
  Character,
  CharacterCustomization,
  CharacterDirection,
} from "./Character";
import { cellSize } from "../scenes/Grid";
import {
  CHARACTER_HEADS,
  CHARACTER_HAIR,
  CHARACTER_SKINS,
  CHARACTER_BODIES,
  CHARACTER_CAPES,
} from "./CharacterSprites";

interface CharacterAction {
  type: "add" | "remove" | "move";
  character: Character;
  previousRow?: number;
  previousColumn?: number;
  newRow?: number;
  newColumn?: number;
}

export class CharacterManager {
  private scene: Phaser.Scene;

  private getLayerGraphics: (layer: number) => Phaser.GameObjects.Graphics;

  private characters: Character[] = [];

  private characterGraphics = new Map<string, Phaser.GameObjects.Container>();
  private draggingCharacter: Character | null = null;

  private undoStack: CharacterAction[] = [];
  private redoStack: CharacterAction[] = [];

  private movePreviewContainer: Phaser.GameObjects.Container;
  private previewDirection: CharacterDirection = "front";

  private moveCurrentRow = 0;
  private moveCurrentColumn = 0;

  private previewLastRow = 0;
  private previewLastColumn = 0;

  private showInvalidMove: (row: number, column: number, layer: number) => void;

  private clearInteraction: () => void;

  private canCharacterMoveTo: (
    row: number,
    column: number,
    layer: number,
  ) => boolean;

  constructor(
    scene: Phaser.Scene,
    getLayerGraphics: (layer: number) => Phaser.GameObjects.Graphics,
    canCharacterMoveTo: (row: number, column: number, layer: number) => boolean,
    showInvalidMove: (row: number, column: number, layer: number) => void,
    clearInteraction: () => void,
  ) {
    this.scene = scene;
    this.getLayerGraphics = getLayerGraphics;
    this.movePreviewContainer = this.scene.add.container(0, 0);
    this.movePreviewContainer.setDepth(101);
    this.movePreviewContainer.setAlpha(0.65);
    this.movePreviewContainer.setVisible(false);
    this.canCharacterMoveTo = canCharacterMoveTo;
    this.showInvalidMove = showInvalidMove;
    this.clearInteraction = clearInteraction;
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
      width: 1,
      height: 1,
      layer,

      direction: "front",

      customization: {
        headId: CHARACTER_HEADS[0].id,
        hairId: CHARACTER_HAIR[0].id,
        skinId: CHARACTER_SKINS[0].id,
        bodyId: CHARACTER_BODIES[0].id,
        capeId: CHARACTER_CAPES[0].id,
      },
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
    const container = this.scene.add.container(0, 0);

    this.drawCharacterSprites(container, character);

    this.characterGraphics.set(character.id, container);

    this.updateCharacterPosition(character);

    container.setDepth(100);
  }

  private drawCharacterSprites(
    container: Phaser.GameObjects.Container,
    character: Character,
  ): void {
    container.removeAll(true);

    const direction = character.direction;

    const head = CHARACTER_HEADS.find(
      (sprite) => sprite.id === character.customization.headId,
    );

    const hair = CHARACTER_HAIR.find(
      (sprite) => sprite.id === character.customization.hairId,
    );

    const skin = CHARACTER_SKINS.find(
      (sprite) => sprite.id === character.customization.skinId,
    );

    const body = CHARACTER_BODIES.find(
      (sprite) => sprite.id === character.customization.bodyId,
    );

    const cape = CHARACTER_CAPES.find(
      (sprite) => sprite.id === character.customization.capeId,
    );

    // CAPE BOTTOM
    if (cape) {
      if (direction === "front") {
        const capeBottom = this.scene.add.image(0, 0, cape.front.bottom);

        capeBottom.setOrigin(0.5, 0.5);
        capeBottom.setDisplaySize(cellSize, cellSize / 2);
        capeBottom.setPosition(0, cellSize * 0.25);

        container.add(capeBottom);
      }
    }

    // BODY
    if (body) {
      const image = this.scene.add.image(0, 0, body[direction]);

      image.setOrigin(0.5, 0.5);

      if (direction === "front") {
        image.setDisplaySize(cellSize, cellSize / 2);

        image.setPosition(0, cellSize * 0.2);
      }

      if (direction === "back") {
        image.setDisplaySize(cellSize * 0.82, cellSize / 2);

        image.setPosition(2, cellSize * 0.2);
      }

      if (direction === "left" || direction === "right") {
        image.setDisplaySize(cellSize * 0.7, cellSize * 0.55);

        image.setPosition(0, cellSize * 0.15);
      }

      container.add(image);

      // SKIN
      if (skin) {
        const skinImage = this.scene.add.image(0, 0, skin[direction]);

        skinImage.setOrigin(0.5, 0.5);

        if (direction === "front") {
          skinImage.setDisplaySize(cellSize, cellSize / 2);
          skinImage.setPosition(0, cellSize * 0.2);
        }

        if (direction === "back") {
          skinImage.setDisplaySize(cellSize * 0.82, cellSize / 2);
          skinImage.setPosition(2, cellSize * 0.2);
        }

        if (direction === "left" || direction === "right") {
          skinImage.setDisplaySize(cellSize * 0.7, cellSize * 0.55);
          skinImage.setPosition(0, cellSize * 0.15);
        }

        container.add(skinImage);
      }
    }

    // CAPE TOP - FRONT
    if (cape && direction === "front") {
      const capeTop = this.scene.add.image(0, 0, cape.front.top);

      capeTop.setOrigin(0.5, 0.5);
      capeTop.setDisplaySize(cellSize, cellSize / 4);
      capeTop.setPosition(0, -cellSize * 0.05);

      container.add(capeTop);
    }

    // CAPE - BACK / LEFT / RIGHT
    if (cape && direction !== "front") {
      const capeImage = this.scene.add.image(0, 0, cape[direction]);

      capeImage.setOrigin(0.5, 0.5);

      if (direction === "back") {
        capeImage.setDisplaySize(cellSize * 0.82, cellSize / 2);

        capeImage.setPosition(-1.25, cellSize * 0.2);
      }

      if (direction === "left") {
        capeImage.setDisplaySize(cellSize * 0.7, cellSize * 0.55);

        capeImage.setPosition(5, cellSize * 0.15);
      }

      if (direction === "right") {
        capeImage.setDisplaySize(cellSize * 0.7, cellSize * 0.55);

        capeImage.setPosition(-5, cellSize * 0.15);
      }

      container.add(capeImage);
    }

    // HEAD
    if (head) {
      const image = this.scene.add.image(0, 0, head[direction]);

      image.setOrigin(0.5, 0.5);

      if (direction === "front") {
        image.setDisplaySize(cellSize, cellSize / 2);

        image.setPosition(0, -cellSize * 0.25);
      }

      if (direction === "back") {
        image.setDisplaySize(cellSize, cellSize / 2);

        image.setPosition(0.2, -cellSize * 0.16);
      }

      if (direction === "left" || direction === "right") {
        image.setDisplaySize(cellSize, cellSize / 2);

        image.setPosition(2, -cellSize * 0.25);
      }

      container.add(image);
    }

    // HAIR
    if (hair) {
      const image = this.scene.add.image(0, 0, hair[direction]);

      image.setOrigin(0.5, 0.5);

      if (direction === "front") {
        image.setDisplaySize(cellSize, cellSize / 2);
        image.setPosition(0, -cellSize * 0.25);
      }

      if (direction === "back") {
        image.setDisplaySize(cellSize, cellSize / 2);
        image.setPosition(0.2, -cellSize * 0.16);
      }

      if (direction === "left" || direction === "right") {
        image.setDisplaySize(cellSize, cellSize / 2);
        image.setPosition(2, -cellSize * 0.25);
      }

      container.add(image);
    }
  }

  updateCharacterPosition(character: Character) {
    const container = this.characterGraphics.get(character.id);

    if (!container) {
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

    container.setPosition(x, y);
    container.setScale(scale);
  }

  updateCharacterCustomization(
    characterId: string,
    customization: CharacterCustomization,
  ): void {
    const character = this.characters.find(
      (character) => character.id === characterId,
    );

    if (!character) {
      return;
    }

    character.customization = {
      ...customization,
    };

    const container = this.characterGraphics.get(characterId);

    if (!container) {
      return;
    }

    this.drawCharacterSprites(container, character);
  }

  eraseAt(row: number, column: number, layer: number) {
    const character = this.getCharacterAt(row, column, layer);

    if (!character) {
      return;
    }

    this.removeCharacter(character);
  }

  getCharacters(): Character[] {
    return this.characters.map((character) => ({
      ...character,
    }));
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

    const characterContainer = this.characterGraphics.get(character.id);

    if (characterContainer) {
      characterContainer.setVisible(false);
    }

    this.moveCurrentRow = character.row;
    this.moveCurrentColumn = character.column;

    this.previewLastRow = character.row;
    this.previewLastColumn = character.column;

    this.previewDirection = character.direction;

    this.drawMovePreview(character);
  }

  private drawMovePreview(character: Character) {
    const layerGraphics = this.getLayerGraphics(character.layer);
    const scale = layerGraphics.scaleX;

    const x =
      layerGraphics.x +
      this.moveCurrentColumn * cellSize * scale +
      (cellSize / 2) * scale;

    const y =
      layerGraphics.y +
      this.moveCurrentRow * cellSize * scale +
      (cellSize / 2) * scale;

    const deltaColumn = this.moveCurrentColumn - this.previewLastColumn;

    const deltaRow = this.moveCurrentRow - this.previewLastRow;

    let direction = this.previewDirection;
    if (deltaColumn > 0) {
      direction = "right";
    } else if (deltaColumn < 0) {
      direction = "left";
    } else if (deltaRow > 0) {
      direction = "front";
    } else if (deltaRow < 0) {
      direction = "back";
    }

    this.previewDirection = direction;

    this.previewLastRow = this.moveCurrentRow;
    this.previewLastColumn = this.moveCurrentColumn;

    const previewCharacter: Character = {
      ...character,
      direction,
    };

    this.drawCharacterSprites(this.movePreviewContainer, previewCharacter);

    this.movePreviewContainer.setPosition(x, y);
    this.movePreviewContainer.setScale(scale);
    this.movePreviewContainer.setVisible(true);
  }

  isDragging() {
    return this.draggingCharacter !== null;
  }

  updateDraggingPosition(row: number, column: number) {
    if (!this.draggingCharacter) {
      return;
    }

    const layer = this.draggingCharacter.layer;

    const existingCharacter = this.getCharacterAt(row, column, layer);

    if (
      existingCharacter &&
      existingCharacter.id !== this.draggingCharacter.id
    ) {
      this.showInvalidMove(row, column, layer);
      return;
    }

    if (!this.canCharacterMoveTo(row, column, layer)) {
      this.showInvalidMove(row, column, layer);
      return;
    }

    this.clearInteraction();

    this.moveCurrentRow = row;
    this.moveCurrentColumn = column;

    this.drawMovePreview(this.draggingCharacter);
  }

  stopDragging() {
    if (!this.draggingCharacter) {
      return;
    }

    const character = this.draggingCharacter;

    character.row = this.moveCurrentRow;
    character.column = this.moveCurrentColumn;

    this.updateCharacterPosition(character);

    const characterContainer = this.characterGraphics.get(character.id);

    if (characterContainer) {
      characterContainer.setVisible(true);
    }

    this.movePreviewContainer.removeAll(true);
    this.movePreviewContainer.setVisible(false);

    this.clearInteraction();
    this.draggingCharacter = null;
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

  restoreCharacters(characters: Character[]) {
    // Remove current graphics
    for (const character of this.characters) {
      const graphics = this.characterGraphics.get(character.id);

      if (graphics) {
        graphics.destroy();
      }
    }

    this.characterGraphics.clear();

    // Restore snapshot
    this.characters = characters.map((character) => ({
      ...character,
    }));

    // Recreate graphics
    for (const character of this.characters) {
      this.drawCharacter(character);
    }
  }
}
