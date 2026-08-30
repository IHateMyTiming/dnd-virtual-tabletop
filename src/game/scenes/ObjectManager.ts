import Phaser from "phaser";
import type { MapObject } from "./MapObjects";

interface ObjectAction {
  type: "add" | "move" | "remove";
  object: MapObject;
  previousRow?: number;
  previousColumn?: number;
  newRow?: number;
  newColumn?: number;
}

const cellSize = 24;

export class ObjectManager {
  private scene: Phaser.Scene;

  private getLayerGraphics: (layer: number) => Phaser.GameObjects.Graphics;

  private objects: MapObject[] = [];

  private objectGraphics = new Map<string, Phaser.GameObjects.Graphics>();

  private selectedObject: MapObject | null = null;

  private draggingObject: MapObject | null = null;

  private dragStartRow: number | null = null;
  private dragStartColumn: number | null = null;

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
    const object: MapObject = {
      id: crypto.randomUUID(),
      type,
      row,
      column,
      layer,
    };

    this.objects.push(object);

    this.drawObject(object);

    this.undoStack.push({
      type: "add",
      object,
    });

    this.redoStack = [];

    return object;
  }

  private drawObject(object: MapObject) {
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
    graphics.setScale(scale);
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

  selectObject(object: MapObject) {
    this.selectedObject = object;

    console.log(`Selected object: ${object.type}`);
  }

  startDragging(object: MapObject) {
    this.draggingObject = object;

    this.dragStartRow = object.row;
    this.dragStartColumn = object.column;

    this.selectObject(object);
  }

  updateDraggingPosition(row: number, column: number) {
    if (!this.draggingObject) {
      return;
    }

    this.draggingObject.row = row;
    this.draggingObject.column = column;

    this.updateObjectPosition(this.draggingObject);
  }

  stopDragging() {
    if (!this.draggingObject) {
      return;
    }

    const object = this.draggingObject;

    if (
      this.dragStartRow !== null &&
      this.dragStartColumn !== null &&
      (this.dragStartRow !== object.row ||
        this.dragStartColumn !== object.column)
    ) {
      this.undoStack.push({
        type: "move",
        object,
        previousRow: this.dragStartRow,
        previousColumn: this.dragStartColumn,
        newRow: object.row,
        newColumn: object.column,
      });

      this.redoStack = [];
    }

    this.draggingObject = null;
    this.dragStartRow = null;
    this.dragStartColumn = null;
  }

  isDragging() {
    return this.draggingObject !== null;
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

    if (this.selectedObject?.id === object.id) {
      this.selectedObject = null;
    }

    this.undoStack.push({
      type: "remove",
      object,
    });

    this.redoStack = [];
  }

  getSelectedObject() {
    return this.selectedObject;
  }

  undo() {
    const action = this.undoStack.pop();

    if (!action) {
      return;
    }

    if (action.type === "add") {
      const index = this.objects.findIndex(
        (object) => object.id === action.object.id,
      );

      if (index !== -1) {
        this.objects.splice(index, 1);
      }

      const graphics = this.objectGraphics.get(action.object.id);

      if (graphics) {
        graphics.destroy();
        this.objectGraphics.delete(action.object.id);
      }
    }

    if (action.type === "remove") {
      const index = this.objects.findIndex(
        (object) => object.id === action.object.id,
      );

      if (index === -1) {
        this.objects.push(action.object);
      }

      this.drawObject(action.object);
    }

    if (action.type === "move") {
      action.object.row = action.previousRow!;
      action.object.column = action.previousColumn!;

      this.updateObjectPosition(action.object);
    }

    this.redoStack.push(action);
  }

  redo() {
    const action = this.redoStack.pop();

    if (!action) {
      return;
    }

    if (action.type === "add") {
      this.objects.push(action.object);

      this.drawObject(action.object);
    }

    if (action.type === "remove") {
      const index = this.objects.findIndex(
        (object) => object.id === action.object.id,
      );

      if (index !== -1) {
        this.objects.splice(index, 1);
      }

      const graphics = this.objectGraphics.get(action.object.id);

      if (graphics) {
        graphics.destroy();
        this.objectGraphics.delete(action.object.id);
      }

      if (this.selectedObject?.id === action.object.id) {
        this.selectedObject = null;
      }
    }

    if (action.type === "move") {
      action.object.row = action.newRow!;
      action.object.column = action.newColumn!;

      this.updateObjectPosition(action.object);
    }

    this.undoStack.push(action);
  }
}
