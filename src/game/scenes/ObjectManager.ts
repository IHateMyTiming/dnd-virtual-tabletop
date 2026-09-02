import Phaser from "phaser";
import type { MapObject } from "./MapObjects";
import type { MapObjectType } from "./MapObjects";
import { gridWidth, gridHeight } from "./Grid";

interface ObjectAction {
  type: "add" | "remove";
  objects: MapObject[];
}

interface ObjectEditAction {
  type: "move" | "resize";
  object: MapObject;
  previousRow: number;
  previousColumn: number;
  previousWidth: number;
  previousHeight: number;
  newRow: number;
  newColumn: number;
  newWidth: number;
  newHeight: number;
}

const cellSize = 24;

type ObjectGameObject = Phaser.GameObjects.Graphics | Phaser.GameObjects.Image;

const OBJECT_DEFINITIONS = {
  boulder: {
    imageKey: "boulder",
    blocksMovement: true,
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

const OBJECT_RULES: Record<
  MapObjectType,
  {
    name: string;
    maxSize: number;
    maxSizeDifference: number;
  }
> = {
  boulder: {
    name: "Boulder",
    maxSize: 10,
    maxSizeDifference: 2,
  },
  tree: {
    name: "Tree",
    maxSize: 10,
    maxSizeDifference: 3,
  },
  table: {
    name: "Table",
    maxSize: 10,
    maxSizeDifference: 2,
  },

  chair: {
    name: "Chair",
    maxSize: 10,
    maxSizeDifference: 2,
  },

  chest: {
    name: "Chest",
    maxSize: 10,
    maxSizeDifference: 2,
  },

  pillar: {
    name: "Pillar",
    maxSize: 10,
    maxSizeDifference: 2,
  },

  statue: {
    name: "Statue",
    maxSize: 10,
    maxSizeDifference: 2,
  },

  door: {
    name: "Door",
    maxSize: 10,
    maxSizeDifference: 2,
  },

  stairs: {
    name: "Stairs",
    maxSize: 10,
    maxSizeDifference: 2,
  },
};
export class ObjectManager {
  private scene: Phaser.Scene;

  private getLayerGraphics: (layer: number) => Phaser.GameObjects.Graphics;

  private objects: MapObject[] = [];

  private objectGraphics = new Map<string, ObjectGameObject>();

  private selectedObject: MapObject | null = null;
  private isMovingObject = false;
  private moveOffsetRow = 0;
  private moveOffsetColumn = 0;
  private moveHandleGraphics: Phaser.GameObjects.Graphics;
  private moveStartRow = 0;
  private moveStartColumn = 0;

  private undoStack: (ObjectAction | ObjectEditAction)[] = [];
  private redoStack: (ObjectAction | ObjectEditAction)[] = [];

  private layerMasks = new Map<number, Phaser.Display.Masks.GeometryMask>();

  constructor(
    scene: Phaser.Scene,
    getLayerGraphics: (layer: number) => Phaser.GameObjects.Graphics,
  ) {
    this.scene = scene;
    this.getLayerGraphics = getLayerGraphics;
    this.moveHandleGraphics = this.scene.add.graphics();
    this.moveHandleGraphics.setDepth(100);
    this.moveHandleGraphics.setVisible(false);
  }

  addObject(
    row: number,
    column: number,
    layer: number,
    type: MapObject["type"] = "boulder",
    width = 1,
    height = 1,
  ) {
    // Check the entire footprint before placing
    for (let r = row; r < row + height; r++) {
      for (let c = column; c < column + width; c++) {
        if (
          row < 0 ||
          column < 0 ||
          row + height > gridHeight ||
          column + width > gridWidth
        ) {
          return;
        }
      }
    }

    const object: MapObject = {
      id: crypto.randomUUID(),
      type,
      row,
      column,
      layer,
      width,
      height,

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

      image.setMask(this.getLayerMask(object.layer));

      image.setDepth(90);

      return;
    }

    // Fallback to the old placeholder graphics
    const graphics = this.scene.add.graphics();

    this.drawObjectGraphic(graphics, object);

    this.objectGraphics.set(object.id, graphics);

    this.updateObjectPosition(object);

    graphics.setMask(this.getLayerMask(object.layer));

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

    // Position the object at the CENTER of its entire footprint
    const x =
      layerGraphics.x + (object.column + object.width / 2) * cellSize * scale;

    const y =
      layerGraphics.y + (object.row + object.height / 2) * cellSize * scale;

    graphics.setPosition(x, y);

    if (graphics instanceof Phaser.GameObjects.Image) {
      graphics.setDisplaySize(
        object.width * cellSize * scale,
        object.height * cellSize * scale,
      );
    } else {
      graphics.setScale(scale * object.width, scale * object.height);
    }

    if (this.selectedObject?.id === object.id) {
      this.updateMoveHandle();
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
          object.layer === layer &&
          row >= object.row &&
          row < object.row + object.height &&
          column >= object.column &&
          column < object.column + object.width,
      ) ?? null
    );
  }

  getSelectedObject(): MapObject | null {
    return this.selectedObject;
  }

  selectObject(object: MapObject | null) {
    this.selectedObject = object;
    this.isMovingObject = false;

    this.updateMoveHandle();
  }

  selectObjectAt(row: number, column: number, layer: number) {
    const object = this.getObjectAt(row, column, layer);

    this.selectObject(object);
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

    if (this.selectedObject?.id === object.id) {
      this.selectObject(null);
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

    if (
      this.selectedObject &&
      objectsToRemove.some((object) => object.id === this.selectedObject?.id)
    ) {
      this.selectObject(null);
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
    width = 1,
    height = 1,
  ) {
    const actionObjects: MapObject[] = [];

    // Find the connected empty area first.
    const queue: Array<[number, number]> = [[startRow, startColumn]];
    const visited = new Set<string>();
    const fillable = new Set<string>();

    while (queue.length > 0) {
      const [row, column] = queue.shift()!;

      if (row < 0 || row >= gridHeight || column < 0 || column >= gridWidth) {
        continue;
      }

      const key = `${row},${column}`;

      if (visited.has(key)) {
        continue;
      }

      visited.add(key);

      // Existing objects are boundaries.
      if (this.getObjectAt(row, column, layer)) {
        continue;
      }

      fillable.add(key);

      queue.push([row - 1, column]);
      queue.push([row + 1, column]);
      queue.push([row, column - 1]);
      queue.push([row, column + 1]);
    }

    /*
     * Keep trying to place objects until no more can fit.
     *
     * We scan the entire connected area instead of jumping
     * by width/height. This prevents gaps in the fill.
     */
    let placedSomething = true;

    while (placedSomething) {
      placedSomething = false;

      for (let row = 0; row < gridHeight; row++) {
        for (let column = 0; column < gridWidth; column++) {
          // The top-left tile must be part of the fill area.
          if (!fillable.has(`${row},${column}`)) {
            continue;
          }

          // Check the complete footprint.
          let canPlace = true;

          for (let objectRow = row; objectRow < row + height; objectRow++) {
            for (
              let objectColumn = column;
              objectColumn < column + width;
              objectColumn++
            ) {
              if (
                objectRow >= gridHeight ||
                objectColumn >= gridWidth ||
                !fillable.has(`${objectRow},${objectColumn}`) ||
                this.getObjectAt(objectRow, objectColumn, layer)
              ) {
                canPlace = false;
                break;
              }
            }

            if (!canPlace) {
              break;
            }
          }

          if (!canPlace) {
            continue;
          }

          const object: MapObject = {
            id: crypto.randomUUID(),
            type,
            row,
            column,
            layer,
            width,
            height,

            imageKey: OBJECT_DEFINITIONS[type].imageKey,
            blocksMovement: OBJECT_DEFINITIONS[type].blocksMovement,
          };

          this.objects.push(object);

          this.drawObject(object);

          actionObjects.push(object);

          // The footprint is now occupied.
          for (let objectRow = row; objectRow < row + height; objectRow++) {
            for (
              let objectColumn = column;
              objectColumn < column + width;
              objectColumn++
            ) {
              fillable.delete(`${objectRow},${objectColumn}`);
            }
          }

          placedSomething = true;
        }
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

  fillRectangle(
    startRow: number,
    startColumn: number,
    endRow: number,
    endColumn: number,
    layer: number,
    type: MapObject["type"] = "boulder",
    width = 1,
    height = 1,
  ) {
    const minRow = Math.max(0, Math.min(startRow, endRow));

    const maxRow = Math.min(gridHeight - 1, Math.max(startRow, endRow));

    const minColumn = Math.max(0, Math.min(startColumn, endColumn));

    const maxColumn = Math.min(gridWidth - 1, Math.max(startColumn, endColumn));

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
          width,
          height,

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
    const maxRow = Math.min(gridHeight - 1, Math.max(startRow, endRow));

    const minColumn = Math.max(0, Math.min(startColumn, endColumn));
    const maxColumn = Math.min(gridWidth - 1, Math.max(startColumn, endColumn));
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

        if (this.selectedObject?.id === object.id) {
          this.selectObject(null);
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
          this.drawObject(object);
        }
      }
    }

    if (action.type === "move" || action.type === "resize") {
      const object = this.objects.find(
        (currentObject) => currentObject.id === action.object.id,
      );

      if (object) {
        object.row = action.previousRow;
        object.column = action.previousColumn;
        object.width = action.previousWidth;
        object.height = action.previousHeight;

        this.updateObjectPosition(object);
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
          this.drawObject(object);
        }
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

        if (this.selectedObject?.id === object.id) {
          this.selectObject(null);
        }
      }
    }

    if (action.type === "move" || action.type === "resize") {
      const object = this.objects.find(
        (currentObject) => currentObject.id === action.object.id,
      );

      if (object) {
        object.row = action.newRow;
        object.column = action.newColumn;
        object.width = action.newWidth;
        object.height = action.newHeight;

        this.updateObjectPosition(object);
      }
    }

    this.undoStack.push(action);
  }

  private getLayerMask(layer: number) {
    const existingMask = this.layerMasks.get(layer);

    if (existingMask) {
      return existingMask;
    }

    const layerGraphics = this.getLayerGraphics(layer);

    const maskGraphics = this.scene.add.graphics();

    maskGraphics.fillStyle(0xffffff, 1);

    maskGraphics.fillRect(
      layerGraphics.x,
      layerGraphics.y,
      gridWidth * cellSize * layerGraphics.scaleX,
      gridHeight * cellSize * layerGraphics.scaleY,
    );

    maskGraphics.setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(
      this.scene,
      maskGraphics,
    );

    this.layerMasks.set(layer, mask);

    return mask;
  }

  canPlaceObject(
    row: number,
    column: number,
    layer: number,
    width: number,
    height: number,
    ignoredObject?: MapObject,
  ): boolean {
    for (let objectRow = row; objectRow < row + height; objectRow++) {
      for (
        let objectColumn = column;
        objectColumn < column + width;
        objectColumn++
      ) {
        if (
          objectRow < 0 ||
          objectRow >= gridHeight ||
          objectColumn < 0 ||
          objectColumn >= gridWidth
        ) {
          return false;
        }

        const existingObject = this.getObjectAt(objectRow, objectColumn, layer);

        if (existingObject && existingObject.id !== ignoredObject?.id) {
          return false;
        }
      }
    }

    return true;
  }

  isValidObjectSize(
    type: MapObjectType,
    width: number,
    height: number,
  ): boolean {
    return Math.abs(width - height) <= OBJECT_RULES[type].maxSizeDifference;
  }

  getObjectName(type: MapObjectType): string {
    return OBJECT_RULES[type].name;
  }

  getMaxSizeDifference(type: MapObjectType): number {
    return OBJECT_RULES[type].maxSizeDifference;
  }

  getMaxSize(type: MapObjectType): number {
    return OBJECT_RULES[type].maxSize;
  }

  clearAllObjects() {
    for (const object of this.objects) {
      const graphics = this.objectGraphics.get(object.id);

      if (graphics) {
        graphics.destroy();
      }
    }

    this.objects = [];
    this.objectGraphics.clear();

    this.selectedObject = null;

    for (const mask of this.layerMasks.values()) {
      mask.destroy();
    }

    this.layerMasks.clear();

    this.undoStack = [];
    this.redoStack = [];
  }

  private drawMoveHandle() {
    const graphics = this.moveHandleGraphics;

    graphics.clear();

    // Background
    graphics.fillStyle(0x222222, 0.9);
    graphics.fillCircle(0, 0, 9);

    // Four arrows
    graphics.lineStyle(2, 0xffffff, 1);

    // Up
    graphics.lineBetween(0, -5, 0, -2);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(0, -7, -3, -3, 3, -3);

    // Down
    graphics.lineBetween(0, 2, 0, 5);
    graphics.fillTriangle(0, 7, -3, 3, 3, 3);

    // Left
    graphics.lineBetween(-5, 0, -2, 0);
    graphics.fillTriangle(-7, 0, -3, -3, -3, 3);

    // Right
    graphics.lineBetween(2, 0, 5, 0);
    graphics.fillTriangle(7, 0, 3, -3, 3, 3);
  }

  private updateMoveHandle() {
    const object = this.selectedObject;

    if (!object) {
      this.moveHandleGraphics.setVisible(false);
      return;
    }

    const layerGraphics = this.getLayerGraphics(object.layer);
    const scale = layerGraphics.scaleX;

    const objectRight =
      layerGraphics.x + (object.column + object.width) * cellSize * scale;

    const objectCenterY =
      layerGraphics.y + (object.row + object.height / 2) * cellSize * scale;

    this.moveHandleGraphics.clear();

    // Background
    this.moveHandleGraphics.fillStyle(0x222222, 1);
    this.moveHandleGraphics.fillCircle(0, 0, 10);

    // Arrows
    this.moveHandleGraphics.fillStyle(0xffffff, 1);

    // Up
    this.moveHandleGraphics.fillTriangle(0, -8, -4, -3, 4, -3);

    // Down
    this.moveHandleGraphics.fillTriangle(0, 8, -4, 3, 4, 3);

    // Left
    this.moveHandleGraphics.fillTriangle(-8, 0, -3, -4, -3, 4);

    // Right
    this.moveHandleGraphics.fillTriangle(8, 0, 3, -4, 3, 4);

    this.moveHandleGraphics.setPosition(
      objectRight + 12 * scale,
      objectCenterY,
    );

    this.moveHandleGraphics.setScale(scale);
    this.moveHandleGraphics.setDepth(100);
    this.moveHandleGraphics.setVisible(true);
  }

  isPointerOnMoveHandle(pointer: Phaser.Input.Pointer): boolean {
    if (!this.selectedObject || !this.moveHandleGraphics.visible) {
      return false;
    }

    const handleX = this.moveHandleGraphics.x;
    const handleY = this.moveHandleGraphics.y;

    const handleSize = 12;

    return (
      pointer.x >= handleX - handleSize &&
      pointer.x <= handleX + handleSize &&
      pointer.y >= handleY - handleSize &&
      pointer.y <= handleY + handleSize
    );
  }

  startMovingSelectedObject(pointer: Phaser.Input.Pointer) {
    if (!this.selectedObject) {
      return;
    }

    const object = this.selectedObject;
    this.moveStartRow = object.row;
    this.moveStartColumn = object.column;
    const layerGraphics = this.getLayerGraphics(object.layer);
    const scale = layerGraphics.scaleX;

    const pointerColumn = (pointer.x - layerGraphics.x) / (cellSize * scale);

    const pointerRow = (pointer.y - layerGraphics.y) / (cellSize * scale);

    this.moveOffsetColumn = pointerColumn - object.column;
    this.moveOffsetRow = pointerRow - object.row;

    this.isMovingObject = true;
  }

  isMovingSelectedObject(): boolean {
    return this.isMovingObject;
  }

  updateMovingSelectedObject(pointer: Phaser.Input.Pointer) {
    if (!this.selectedObject || !this.isMovingObject) {
      return;
    }

    const object = this.selectedObject;
    const layerGraphics = this.getLayerGraphics(object.layer);
    const scale = layerGraphics.scaleX;

    const pointerColumn = (pointer.x - layerGraphics.x) / (cellSize * scale);

    const pointerRow = (pointer.y - layerGraphics.y) / (cellSize * scale);

    const targetColumn = Math.round(pointerColumn - this.moveOffsetColumn);

    const targetRow = Math.round(pointerRow - this.moveOffsetRow);

    if (targetRow === object.row && targetColumn === object.column) {
      return;
    }

    const canMove = this.canPlaceObject(
      targetRow,
      targetColumn,
      object.layer,
      object.width,
      object.height,
      object,
    );

    if (!canMove) {
      return;
    }

    object.row = targetRow;
    object.column = targetColumn;

    this.updateObjectPosition(object);
  }

  stopMovingSelectedObject() {
    if (!this.selectedObject || !this.isMovingObject) {
      return;
    }

    const object = this.selectedObject;

    if (
      object.row !== this.moveStartRow ||
      object.column !== this.moveStartColumn
    ) {
      this.undoStack.push({
        type: "move",
        object,
        previousRow: this.moveStartRow,
        previousColumn: this.moveStartColumn,
        previousWidth: object.width,
        previousHeight: object.height,
        newRow: object.row,
        newColumn: object.column,
        newWidth: object.width,
        newHeight: object.height,
      });

      this.redoStack = [];
    }

    this.isMovingObject = false;
  }

  resizeSelectedObject(width: number, height: number): boolean {
    if (!this.selectedObject) {
      return false;
    }

    const object = this.selectedObject;

    if (object.width === width && object.height === height) {
      return true;
    }

    const canResize = this.canPlaceObject(
      object.row,
      object.column,
      object.layer,
      width,
      height,
      object,
    );

    if (!canResize) {
      return false;
    }

    const previousWidth = object.width;
    const previousHeight = object.height;

    object.width = width;
    object.height = height;

    this.updateObjectPosition(object);

    this.undoStack.push({
      type: "resize",
      object,
      previousRow: object.row,
      previousColumn: object.column,
      previousWidth,
      previousHeight,
      newRow: object.row,
      newColumn: object.column,
      newWidth: width,
      newHeight: height,
    });

    this.redoStack = [];

    return true;
  }
}
