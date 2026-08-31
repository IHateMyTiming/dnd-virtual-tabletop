import Phaser from "phaser";
import type { MapObject } from "./MapObjects";

interface ObjectAction {
  type: "add" | "remove";
  objects: MapObject[];
}

const cellSize = 24;

type ObjectGameObject = Phaser.GameObjects.Graphics | Phaser.GameObjects.Image;

const OBJECT_DEFINITIONS = {
  boulder: {
    imageKey: "boulder",
    blocksMovement: true,
    width: 20,
    height: 20,
  },

  tree: {
    imageKey: "tree",
    blocksMovement: true,
  },

  table: {
    imageKey: "table",
    blocksMovement: true,
  },

  chair: {
    imageKey: "chair",
    blocksMovement: false,
  },

  chest: {
    imageKey: "chest",
    blocksMovement: true,
  },

  pillar: {
    imageKey: "pillar",
    blocksMovement: true,
  },

  statue: {
    imageKey: "statue",
    blocksMovement: true,
  },

  door: {
    imageKey: "door",
    blocksMovement: true,
  },

  stairs: {
    imageKey: "stairs",
    blocksMovement: false,
  },
};

export class ObjectManager {
  private scene: Phaser.Scene;

  private getLayerGraphics: (layer: number) => Phaser.GameObjects.Graphics;

  private objects: MapObject[] = [];

  private objectGraphics = new Map<string, ObjectGameObject>();

  private undoStack: ObjectAction[] = [];
  private redoStack: ObjectAction[] = [];

  constructor(
    scene: Phaser.Scene,
    getLayerGraphics: (layer: number) => Phaser.GameObjects.Graphics,
  ) {
    this.scene = scene;
    this.getLayerGraphics = getLayerGraphics;
  }

  addObject(
    row: number,
    column: number,
    layer: number,
    type: MapObject["type"] = "boulder",
  ) {
    // Don't allow two objects on the same tile
    if (this.getObjectAt(row, column, layer)) {
      return null;
    }

    const object: MapObject = {
      id: crypto.randomUUID(),
      type,
      row,
      column,
      layer,

      imageKey: OBJECT_DEFINITIONS[type].imageKey,
      blocksMovement: OBJECT_DEFINITIONS[type].blocksMovement,
    };

    this.objects.push(object);

    this.drawObject(object);

    this.undoStack.push({
      type: "add",
      objects: [object],
    });

    this.redoStack = [];

    return object;
  }

  private drawObject(object: MapObject) {
    if (object.imageKey && this.scene.textures.exists(object.imageKey)) {
      const image = this.scene.add.image(0, 0, object.imageKey);

      this.objectGraphics.set(object.id, image);

      this.updateObjectPosition(object);

      image.setDepth(90);

      return;
    }

    // Fallback to the old placeholder graphics
    const graphics = this.scene.add.graphics();

    this.drawObjectGraphic(graphics, object);

    this.objectGraphics.set(object.id, graphics);

    this.updateObjectPosition(object);

    graphics.setDepth(90);
  }

  private drawObjectGraphic(
    graphics: Phaser.GameObjects.Graphics,
    object: MapObject,
  ) {
    graphics.clear();

    if (object.type === "boulder") {
      graphics.fillStyle(0x666666, 1);

      graphics.fillCircle(0, 0, cellSize * 0.42);

      graphics.lineStyle(2, 0x333333, 1);

      graphics.strokeCircle(0, 0, cellSize * 0.42);
    }

    if (object.type === "tree") {
      graphics.fillStyle(0x6b4423, 1);
      graphics.fillRect(
        -cellSize * 0.12,
        -cellSize * 0.05,
        cellSize * 0.24,
        cellSize * 0.5,
      );

      graphics.fillStyle(0x2f7d32, 1);
      graphics.fillCircle(0, -cellSize * 0.2, cellSize * 0.4);

      graphics.fillStyle(0x3f963f, 1);
      graphics.fillCircle(-cellSize * 0.2, -cellSize * 0.05, cellSize * 0.3);

      graphics.fillStyle(0x3f963f, 1);
      graphics.fillCircle(cellSize * 0.2, -cellSize * 0.05, cellSize * 0.3);
    }
  }

  updateObjectPosition(object: MapObject) {
    const graphics = this.objectGraphics.get(object.id);

    if (!graphics) {
      return;
    }

    const layerGraphics = this.getLayerGraphics(object.layer);

    const scale = layerGraphics.scaleX;

    const x =
      layerGraphics.x +
      object.column * cellSize * scale +
      (cellSize / 2) * scale;

    const y =
      layerGraphics.y + object.row * cellSize * scale + (cellSize / 2) * scale;

    graphics.setPosition(x, y);

    if (graphics instanceof Phaser.GameObjects.Image) {
      graphics.setDisplaySize(cellSize * scale, cellSize * scale);
    } else {
      graphics.setScale(scale);
    }
  }

  updateAllObjectPositions() {
    for (const object of this.objects) {
      this.updateObjectPosition(object);
    }
  }

  getObjects() {
    return this.objects;
  }

  getObjectAt(row: number, column: number, layer: number): MapObject | null {
    return (
      this.objects.find(
        (object) =>
          object.row === row &&
          object.column === column &&
          object.layer === layer,
      ) ?? null
    );
  }

  eraseAt(row: number, column: number, layer: number) {
    const object = this.getObjectAt(row, column, layer);

    if (!object) {
      return;
    }

    this.removeObject(object);
  }

  removeObject(object: MapObject) {
    const index = this.objects.findIndex(
      (currentObject) => currentObject.id === object.id,
    );

    if (index === -1) {
      return;
    }

    this.objects.splice(index, 1);

    const graphics = this.objectGraphics.get(object.id);

    if (graphics) {
      graphics.destroy();

      this.objectGraphics.delete(object.id);
    }

    this.undoStack.push({
      type: "remove",
      objects: [object],
    });

    this.redoStack = [];
  }

  removeAllObjects(layer: number) {
    const objectsToRemove = this.objects.filter(
      (object) => object.layer === layer,
    );

    if (objectsToRemove.length === 0) {
      return;
    }

    for (const object of objectsToRemove) {
      const index = this.objects.findIndex(
        (currentObject) => currentObject.id === object.id,
      );

      if (index !== -1) {
        this.objects.splice(index, 1);
      }

      const graphics = this.objectGraphics.get(object.id);

      if (graphics) {
        graphics.destroy();

        this.objectGraphics.delete(object.id);
      }
    }

    // ONE undo action for the entire erase-all
    this.undoStack.push({
      type: "remove",
      objects: objectsToRemove,
    });

    this.redoStack = [];
  }

  fill(
    startRow: number,
    startColumn: number,
    layer: number,
    type: MapObject["type"] = "boulder",
    gridSize = 30,
  ) {
    const actionObjects: MapObject[] = [];

    const queue: Array<[number, number]> = [];

    const visited = new Set<string>();

    queue.push([startRow, startColumn]);

    while (queue.length > 0) {
      const [row, column] = queue.shift()!;

      if (row < 0 || row >= gridSize || column < 0 || column >= gridSize) {
        continue;
      }

      const key = `${row},${column}`;

      if (visited.has(key)) {
        continue;
      }

      visited.add(key);

      // Stop at existing objects
      if (this.getObjectAt(row, column, layer)) {
        continue;
      }

      const object: MapObject = {
        id: crypto.randomUUID(),
        type,
        row,
        column,
        layer,

        imageKey: OBJECT_DEFINITIONS[type].imageKey,
        blocksMovement: OBJECT_DEFINITIONS[type].blocksMovement,
      };

      this.objects.push(object);

      this.drawObject(object);

      actionObjects.push(object);

      queue.push([row - 1, column]);

      queue.push([row + 1, column]);

      queue.push([row, column - 1]);

      queue.push([row, column + 1]);
    }

    if (actionObjects.length > 0) {
      this.undoStack.push({
        type: "add",
        objects: actionObjects,
      });

      this.redoStack = [];
    }
  }

  fillRectangle(
    startRow: number,
    startColumn: number,
    endRow: number,
    endColumn: number,
    layer: number,
    type: MapObject["type"] = "boulder",
    gridSize = 30,
  ) {
    const minRow = Math.max(0, Math.min(startRow, endRow));

    const maxRow = Math.min(gridSize - 1, Math.max(startRow, endRow));

    const minColumn = Math.max(0, Math.min(startColumn, endColumn));

    const maxColumn = Math.min(gridSize - 1, Math.max(startColumn, endColumn));

    const actionObjects: MapObject[] = [];

    for (let row = minRow; row <= maxRow; row++) {
      for (let column = minColumn; column <= maxColumn; column++) {
        // Don't place on an occupied tile
        if (this.getObjectAt(row, column, layer)) {
          continue;
        }

        const object: MapObject = {
          id: crypto.randomUUID(),
          type,
          row,
          column,
          layer,

          imageKey: OBJECT_DEFINITIONS[type].imageKey,
          blocksMovement: OBJECT_DEFINITIONS[type].blocksMovement,
        };

        this.objects.push(object);

        this.drawObject(object);

        actionObjects.push(object);
      }
    }

    if (actionObjects.length > 0) {
      this.undoStack.push({
        type: "add",
        objects: actionObjects,
      });

      this.redoStack = [];
    }
  }

  drawRectanglePreview(
    startRow: number,
    startColumn: number,
    endRow: number,
    endColumn: number,
    layer: number,
    graphics: Phaser.GameObjects.Graphics,
  ) {
    graphics.clear();

    const minRow = Math.max(0, Math.min(startRow, endRow));
    const maxRow = Math.min(29, Math.max(startRow, endRow));

    const minColumn = Math.max(0, Math.min(startColumn, endColumn));
    const maxColumn = Math.min(29, Math.max(startColumn, endColumn));

    const layerGraphics = this.getLayerGraphics(layer);

    const scale = layerGraphics.scaleX;

    const x = layerGraphics.x + minColumn * cellSize * scale;

    const y = layerGraphics.y + minRow * cellSize * scale;

    const width = (maxColumn - minColumn + 1) * cellSize * scale;

    const height = (maxRow - minRow + 1) * cellSize * scale;

    graphics.fillStyle(0x888888, 0.25);

    graphics.fillRect(x, y, width, height);

    graphics.lineStyle(2, 0xffffff, 0.8);

    graphics.strokeRect(x, y, width, height);
  }

  undo() {
    const action = this.undoStack.pop();

    if (!action) {
      return;
    }

    if (action.type === "add") {
      for (const object of action.objects) {
        const index = this.objects.findIndex(
          (currentObject) => currentObject.id === object.id,
        );

        if (index !== -1) {
          this.objects.splice(index, 1);
        }

        const graphics = this.objectGraphics.get(object.id);

        if (graphics) {
          graphics.destroy();

          this.objectGraphics.delete(object.id);
        }
      }
    }

    if (action.type === "remove") {
      for (const object of action.objects) {
        const exists = this.objects.some(
          (currentObject) => currentObject.id === object.id,
        );

        if (!exists) {
          this.objects.push(object);
        }

        this.drawObject(object);
      }
    }

    this.redoStack.push(action);
  }

  redo() {
    const action = this.redoStack.pop();

    if (!action) {
      return;
    }

    if (action.type === "add") {
      for (const object of action.objects) {
        const exists = this.objects.some(
          (currentObject) => currentObject.id === object.id,
        );

        if (!exists) {
          this.objects.push(object);
        }

        this.drawObject(object);
      }
    }

    if (action.type === "remove") {
      for (const object of action.objects) {
        const index = this.objects.findIndex(
          (currentObject) => currentObject.id === object.id,
        );

        if (index !== -1) {
          this.objects.splice(index, 1);
        }

        const graphics = this.objectGraphics.get(object.id);

        if (graphics) {
          graphics.destroy();

          this.objectGraphics.delete(object.id);
        }
      }
    }

    this.undoStack.push(action);
  }
}
