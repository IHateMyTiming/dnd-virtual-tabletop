import Phaser from "phaser";
import { CharacterManager } from "../characters/CharacterManager";
import { ObjectManager } from "./ObjectManager";
import type { MapObjectType } from "./MapObjects";
import { InteractionManager } from "../input/InteractionManager";
import { translations, getCurrentLanguage } from "../translation/translation";
import { gridWidth, gridHeight, setGridSize, cellSize } from "./Grid";
import { TerrainManager } from "./TerrainManager";
import {
  TERRAIN_VARIANTS,
  type TerrainCategory,
  type TerrainVariant,
} from "./TerrainObject";

type Tool =
  | "brush"
  | "rectangle"
  | "fill"
  | "character-add"
  | "character-select"
  | "character-erase"
  | "object-brush"
  | "object-rectangle"
  | "object-fill"
  | "object-erase"
  | "object-select";

interface Tile {
  terrain: TerrainVariant | null;
}

interface TileChange {
  row: number;
  column: number;
  previousTerrain: TerrainVariant | null;
  newTerrain: TerrainVariant | null;
}

interface MapAction {
  changes: TileChange[];
}
export class MapScene extends Phaser.Scene {
  private layers: Tile[][][] = [];
  private currentLayer = 0;

  private layerGraphics: Phaser.GameObjects.Graphics[] = [];

  private previewGraphics!: Phaser.GameObjects.Graphics;
  private objectPreviewGraphics!: Phaser.GameObjects.Graphics;

  private selectedTerrain: TerrainVariant = TERRAIN_VARIANTS[0];
  private selectedTool: Tool = "brush";

  private isPainting = false;

  private lastPaintedRow: number | null = null;
  private lastPaintedColumn: number | null = null;

  private startPaintedRow: number | null = null;
  private startPaintedColumn: number | null = null;

  private undoStack: MapAction[] = [];
  private redoStack: MapAction[] = [];

  private currentAction: MapAction | null = null;

  private characterManager!: CharacterManager;
  private objectManager!: ObjectManager;

  private selectedObjectType: MapObjectType = "boulder";

  private selectedObjectWidth = 1;
  private selectedObjectHeight = 1;

  private objectIsPainting = false;

  private objectStartRow: number | null = null;
  private objectStartColumn: number | null = null;

  private objectSelectStartRow: number | null = null;
  private objectSelectStartColumn: number | null = null;
  private isSelectingObjects = false;

  private interactionManager!: InteractionManager;

  private terrainManager!: TerrainManager;

  constructor() {
    super("MapScene");
  }

  private drawTile(
    graphics: Phaser.GameObjects.Graphics,
    layer: number,
    row: number,
    column: number,
  ) {
    const tile = this.layers[layer][row][column];

    const x = column * cellSize;
    const y = row * cellSize;

    // Base tile
    graphics.fillStyle(0x1e1e1e);
    graphics.fillRect(x, y, cellSize, cellSize);

    // Draw grid
    graphics.lineStyle(1, 0x555555);
    graphics.strokeRect(x, y, cellSize, cellSize);
  }

  private paintTile(pointer: Phaser.Input.Pointer) {
    const { row, column } = this.getPointerTile(pointer, this.currentLayer);

    if (row < 0 || row >= gridHeight || column < 0 || column >= gridWidth) {
      return;
    }

    if (this.lastPaintedRow === null || this.lastPaintedColumn === null) {
      this.paintSingleTile(row, column);

      this.lastPaintedRow = row;
      this.lastPaintedColumn = column;

      return;
    }

    const startRow = this.lastPaintedRow;
    const startColumn = this.lastPaintedColumn;

    const distance = Math.max(
      Math.abs(row - startRow),
      Math.abs(column - startColumn),
    );

    for (let i = 1; i <= distance; i++) {
      const currentRow = Math.round(
        startRow + ((row - startRow) * i) / distance,
      );

      const currentColumn = Math.round(
        startColumn + ((column - startColumn) * i) / distance,
      );

      this.paintSingleTile(currentRow, currentColumn);
    }

    this.lastPaintedRow = row;
    this.lastPaintedColumn = column;
  }

  private paintSingleTile(row: number, column: number): void {
    const variant = this.selectedTerrain;

    if (
      !this.terrainManager.canPlaceTerrain(
        row,
        column,
        variant.width,
        variant.height,
        this.currentLayer,
      )
    ) {
      return;
    }

    this.terrainManager.addTerrain(variant, row, column, this.currentLayer);
  }

  private fillRectangle(
    startRow: number,
    startColumn: number,
    endRow: number,
    endColumn: number,
  ) {
    const minRow = Math.max(0, Math.min(startRow, endRow));

    const maxRow = Math.min(gridHeight - 1, Math.max(startRow, endRow));

    const minColumn = Math.max(0, Math.min(startColumn, endColumn));

    const maxColumn = Math.min(gridWidth - 1, Math.max(startColumn, endColumn));

    for (let row = minRow; row <= maxRow; row++) {
      for (let column = minColumn; column <= maxColumn; column++) {
        this.paintSingleTile(row, column);
      }
    }
  }

  private drawRectanglePreview(
    startRow: number,
    startColumn: number,
    endRow: number,
    endColumn: number,
  ) {
    this.previewGraphics.clear();

    const minRow = Math.max(0, Math.min(startRow, endRow));

    const maxRow = Math.min(gridHeight - 1, Math.max(startRow, endRow));

    const minColumn = Math.max(0, Math.min(startColumn, endColumn));

    const maxColumn = Math.min(gridWidth - 1, Math.max(startColumn, endColumn));

    const { offsetX, offsetY, scale } = this.getLayerOffset(this.currentLayer);

    const x = offsetX + minColumn * cellSize * scale;

    const y = offsetY + minRow * cellSize * scale;

    const width = (maxColumn - minColumn + 1) * cellSize * scale;

    const height = (maxRow - minRow + 1) * cellSize * scale;

    this.previewGraphics.fillStyle(0xffffff, 0.2);

    this.previewGraphics.fillRect(x, y, width, height);

    this.previewGraphics.lineStyle(2, 0xffffff, 0.8);

    this.previewGraphics.strokeRect(x, y, width, height);
  }

  private fillTile(startRow: number, startColumn: number) {
    const originalTerrain =
      this.layers[this.currentLayer][startRow][startColumn].terrain;

    const newTerrain = this.selectedTerrain;

    if (originalTerrain === newTerrain) {
      return;
    }

    const action: MapAction = {
      changes: [],
    };

    const queue: Array<[number, number]> = [[startRow, startColumn]];

    while (queue.length > 0) {
      const [row, column] = queue.shift()!;

      if (row < 0 || row >= gridHeight || column < 0 || column >= gridWidth) {
        continue;
      }

      if (
        this.layers[this.currentLayer][row][column].terrain !== originalTerrain
      ) {
        continue;
      }

      action.changes.push({
        row,
        column,
        previousTerrain: originalTerrain,
        newTerrain,
      });

      this.layers[this.currentLayer][row][column].terrain = newTerrain;

      this.drawTile(
        this.layerGraphics[this.currentLayer],
        this.currentLayer,
        row,
        column,
      );

      queue.push([row - 1, column]);

      queue.push([row + 1, column]);

      queue.push([row, column - 1]);

      queue.push([row, column + 1]);
    }

    if (action.changes.length > 0) {
      this.undoStack.push(action);
      this.redoStack = [];
    }
  }

  private undoTerrain() {
    const action = this.undoStack.pop();

    if (!action) {
      return;
    }

    for (const change of action.changes) {
      this.layers[this.currentLayer][change.row][change.column].terrain =
        change.previousTerrain;

      this.drawTile(
        this.layerGraphics[this.currentLayer],
        this.currentLayer,
        change.row,
        change.column,
      );
    }

    this.redoStack.push(action);
  }

  private redoTerrain() {
    const action = this.redoStack.pop();

    if (!action) {
      return;
    }

    for (const change of action.changes) {
      this.layers[this.currentLayer][change.row][change.column].terrain =
        change.newTerrain;

      this.drawTile(
        this.layerGraphics[this.currentLayer],
        this.currentLayer,
        change.row,
        change.column,
      );
    }

    this.undoStack.push(action);
  }

  private getLayerOffset(layer: number) {
    const difference = layer - this.currentLayer;

    if (difference === 0) {
      return {
        offsetX: 120,
        offsetY: 0,
        scale: 1,
      };
    }

    if (difference === -1) {
      return {
        offsetX: 0,
        offsetY: 270,
        scale: 0.25,
      };
    }

    if (difference === 1) {
      return {
        offsetX: 780,
        offsetY: 270,
        scale: 0.25,
      };
    }

    return {
      offsetX: -10000,
      offsetY: 0,
      scale: 1,
    };
  }

  private updateLayerPositions() {
    for (let layer = 0; layer < this.layerGraphics.length; layer++) {
      const { offsetX, offsetY, scale } = this.getLayerOffset(layer);

      this.layerGraphics[layer].setPosition(offsetX, offsetY);

      this.layerGraphics[layer].setScale(scale);
    }
  }

  private redrawLayer(layer: number) {
    const graphics = this.layerGraphics[layer];

    graphics.clear();

    for (let row = 0; row < gridHeight; row++) {
      for (let column = 0; column < gridWidth; column++) {
        this.drawTile(graphics, layer, row, column);
      }
    }
  }

  private bringCurrentLayerToFront() {
    for (let layer = 0; layer < this.layerGraphics.length; layer++) {
      this.layerGraphics[layer].setDepth(layer);
    }

    this.layerGraphics[this.currentLayer].setDepth(
      this.layerGraphics.length + 1,
    );
  }

  private updateLayerCounter() {
    const element = document.querySelector<HTMLSpanElement>("#current-layer");

    if (element) {
      element.textContent = String(this.currentLayer + 1);
    }
  }

  private getPointerTile(pointer: Phaser.Input.Pointer, layer: number) {
    const graphics = this.layerGraphics[layer];

    const scale = graphics.scaleX;

    const column = Math.floor((pointer.x - graphics.x) / (cellSize * scale));

    const row = Math.floor((pointer.y - graphics.y) / (cellSize * scale));

    return {
      row,
      column,
    };
  }

  private changeLayer(layer: number) {
    if (layer < 0 || layer >= this.layers.length) {
      return;
    }

    this.currentLayer = layer;

    this.updateLayerPositions();
    this.bringCurrentLayerToFront();
    this.updateLayerCounter();

    this.characterManager.updateAllCharacterPositions();

    this.objectManager.updateAllObjectPositions();
  }

  private previousLayer() {
    this.changeLayer(this.currentLayer - 1);
  }

  private nextLayer() {
    this.changeLayer(this.currentLayer + 1);
  }

  private addLayer() {
    const newLayer: Tile[][] = [];

    for (let row = 0; row < gridHeight; row++) {
      newLayer[row] = [];

      for (let column = 0; column < gridWidth; column++) {
        newLayer[row][column] = {
          terrain: null,
        };
      }
    }

    this.layers.push(newLayer);

    const graphics = this.add.graphics();

    this.layerGraphics.push(graphics);

    const newLayerIndex = this.layers.length - 1;

    this.redrawLayer(newLayerIndex);

    this.currentLayer = newLayerIndex;

    this.updateLayerPositions();
    this.bringCurrentLayerToFront();
    this.updateLayerCounter();
  }

  private removeLayer() {
    if (this.layers.length <= 1) {
      return;
    }

    const graphics = this.layerGraphics.splice(this.currentLayer, 1)[0];

    graphics?.destroy();

    this.layers.splice(this.currentLayer, 1);

    if (this.currentLayer >= this.layers.length) {
      this.currentLayer = this.layers.length - 1;
    }

    this.updateLayerPositions();
    this.bringCurrentLayerToFront();
    this.updateLayerCounter();

    this.undoStack = [];
    this.redoStack = [];
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (
      this.selectedTool === "object-select" &&
      this.objectManager.isPointerOnMoveHandle(pointer)
    ) {
      this.objectManager.startMovingSelectedObject(pointer);
      return;
    }

    const { row, column } = this.getPointerTile(pointer, this.currentLayer);

    if (row < 0 || row >= gridHeight || column < 0 || column >= gridWidth) {
      return;
    }

    // CHARACTER ADD
    if (this.selectedTool === "character-add") {
      this.characterManager.addCharacter(row, column, this.currentLayer);

      return;
    }

    // CHARACTER SELECT
    if (this.selectedTool === "character-select") {
      const character = this.characterManager.getCharacterAt(
        row,
        column,
        this.currentLayer,
      );

      if (character) {
        this.characterManager.startDragging(character);
      }

      return;
    }

    if (this.selectedTool === "character-erase") {
      this.characterManager.eraseAt(row, column, this.currentLayer);

      return;
    }

    if (this.selectedTool === "object-select") {
      this.objectSelectStartRow = row;
      this.objectSelectStartColumn = column;
      this.isSelectingObjects = true;

      return;
    }

    if (this.selectedTool === "object-brush") {
      this.objectIsPainting = true;

      this.objectManager.addObject(
        row,
        column,
        this.currentLayer,
        this.selectedObjectType,
        this.selectedObjectWidth,
        this.selectedObjectHeight,
      );

      return;
    }

    if (this.selectedTool === "object-erase") {
      this.objectIsPainting = true;

      this.objectManager.eraseAt(row, column, this.currentLayer);

      return;
    }
    // TERRAIN FILL
    if (this.selectedTool === "fill") {
      this.fillTile(row, column);

      return;
    }

    if (this.selectedTool === "rectangle") {
      this.isPainting = true;

      this.currentAction = {
        changes: [],
      };

      this.startPaintedRow = row;

      this.startPaintedColumn = column;

      return;
    }

    // OBJECT RECTANGLE
    if (this.selectedTool === "object-rectangle") {
      this.objectIsPainting = true;

      this.objectStartRow = row;

      this.objectStartColumn = column;

      return;
    }

    // OBJECT FILL
    if (this.selectedTool === "object-fill") {
      this.objectManager.fill(
        row,
        column,
        this.currentLayer,
        this.selectedObjectType,
        this.selectedObjectWidth,
        this.selectedObjectHeight,
      );

      return;
    }

    // TERRAIN BRUSH
    if (this.selectedTool === "brush") {
      this.isPainting = true;

      this.currentAction = {
        changes: [],
      };

      this.lastPaintedRow = null;

      this.lastPaintedColumn = null;

      this.paintTile(pointer);
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (
      this.selectedTool === "object-select" &&
      this.objectManager.isMovingSelectedObject()
    ) {
      this.objectManager.updateMovingSelectedObject(pointer);
      return;
    }

    if (
      this.selectedTool === "object-select" &&
      this.isSelectingObjects &&
      this.objectSelectStartRow !== null &&
      this.objectSelectStartColumn !== null
    ) {
      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      this.objectManager.drawRectanglePreview(
        this.objectSelectStartRow,
        this.objectSelectStartColumn,
        row,
        column,
        this.currentLayer,
        this.objectPreviewGraphics,
      );

      return;
    }

    if (this.selectedTool === "object-brush" && !this.objectIsPainting) {
      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      const { offsetX, offsetY, scale } = this.getLayerOffset(
        this.currentLayer,
      );

      const valid =
        row >= 0 &&
        row < gridHeight &&
        column >= 0 &&
        column < gridWidth &&
        this.objectManager.canPlaceObject(
          row,
          column,
          this.currentLayer,
          this.selectedObjectWidth,
          this.selectedObjectHeight,
        );

      this.interactionManager.showObjectPlacementPreview(
        row,
        column,
        this.selectedObjectWidth,
        this.selectedObjectHeight,
        cellSize,
        offsetX,
        offsetY,
        scale,
        valid,
      );

      return;
    }
    // CHARACTER DRAGGING
    if (
      this.selectedTool === "character-select" &&
      this.characterManager.isDragging()
    ) {
      if (!pointer.isDown) {
        return;
      }

      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      if (row >= 0 && row < gridHeight && column >= 0 && column < gridWidth) {
        this.characterManager.updateDraggingPosition(row, column);
      }

      return;
    }

    if (this.selectedTool === "object-erase" && this.objectIsPainting) {
      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      if (row >= 0 && row < gridHeight && column >= 0 && column < gridWidth) {
        this.objectManager.eraseAt(row, column, this.currentLayer);
      }

      return;
    }

    if (!this.isPainting && !this.objectIsPainting) {
      return;
    }

    if (!pointer.isDown) {
      return;
    }

    if (this.selectedTool === "brush") {
      this.paintTile(pointer);
    }

    if (
      this.selectedTool === "rectangle" &&
      this.startPaintedRow !== null &&
      this.startPaintedColumn !== null
    ) {
      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      this.drawRectanglePreview(
        this.startPaintedRow,
        this.startPaintedColumn,
        row,
        column,
      );
    }

    if (
      this.selectedTool === "object-rectangle" &&
      this.objectStartRow !== null &&
      this.objectStartColumn !== null
    ) {
      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      this.objectManager.drawRectanglePreview(
        this.objectStartRow,
        this.objectStartColumn,
        row,
        column,
        this.currentLayer,
        this.objectPreviewGraphics,
      );
    }

    if (this.selectedTool === "object-brush") {
      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      if (row >= 0 && row < gridHeight && column >= 0 && column < gridWidth) {
        this.objectManager.addObject(
          row,
          column,
          this.currentLayer,
          this.selectedObjectType,
          this.selectedObjectWidth,
          this.selectedObjectHeight,
        );
      }
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer) {
    if (
      this.selectedTool === "object-select" &&
      this.objectManager.isMovingSelectedObject()
    ) {
      this.objectManager.stopMovingSelectedObject();
      return;
    }

    if (
      this.selectedTool === "object-select" &&
      this.isSelectingObjects &&
      this.objectSelectStartRow !== null &&
      this.objectSelectStartColumn !== null
    ) {
      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      if (
        row === this.objectSelectStartRow &&
        column === this.objectSelectStartColumn
      ) {
        this.objectManager.selectObjectAt(row, column, this.currentLayer);
      } else {
        this.objectManager.selectObjectsInArea(
          this.objectSelectStartRow,
          this.objectSelectStartColumn,
          row,
          column,
          this.currentLayer,
        );
      }

      this.objectSelectStartRow = null;
      this.objectSelectStartColumn = null;
      this.isSelectingObjects = false;

      this.objectPreviewGraphics.clear();

      return;
    }
    // CHARACTER
    // CHARACTER SELECT
    if (
      this.selectedTool === "character-select" &&
      this.characterManager.isDragging()
    ) {
      this.characterManager.stopDragging();
      return;
    }

    if (
      this.selectedTool === "object-rectangle" &&
      this.objectStartRow !== null &&
      this.objectStartColumn !== null
    ) {
      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      this.objectManager.fillRectangle(
        this.objectStartRow,
        this.objectStartColumn,
        row,
        column,
        this.currentLayer,
        this.selectedObjectType,
        this.selectedObjectWidth,
        this.selectedObjectHeight,
      );
    }

    if (
      this.selectedTool === "rectangle" &&
      this.startPaintedRow !== null &&
      this.startPaintedColumn !== null
    ) {
      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      this.fillRectangle(
        this.startPaintedRow,
        this.startPaintedColumn,
        row,
        column,
      );
    }

    this.previewGraphics.clear();
    this.objectPreviewGraphics.clear();
    this.interactionManager.clear();

    if (this.currentAction !== null && this.currentAction.changes.length > 0) {
      this.undoStack.push(this.currentAction);

      this.redoStack = [];
    }

    this.currentAction = null;

    this.isPainting = false;
    this.objectIsPainting = false;

    this.lastPaintedRow = null;
    this.lastPaintedColumn = null;

    this.startPaintedRow = null;
    this.startPaintedColumn = null;

    this.objectStartRow = null;
    this.objectStartColumn = null;
  }

  private resetMap() {
    // Destroy existing layer graphics
    for (const graphics of this.layerGraphics) {
      graphics.destroy();
    }

    this.layerGraphics = [];
    this.layers = [];

    // Clear characters and objects
    this.characterManager.removeAllCharacters();
    this.objectManager.clearAllObjects();
    // Reset map state
    this.currentLayer = 0;

    this.undoStack = [];
    this.redoStack = [];

    this.currentAction = null;

    this.isPainting = false;
    this.objectIsPainting = false;

    this.lastPaintedRow = null;
    this.lastPaintedColumn = null;

    this.startPaintedRow = null;
    this.startPaintedColumn = null;

    this.objectStartRow = null;
    this.objectStartColumn = null;

    this.objectSelectStartRow = null;
    this.objectSelectStartColumn = null;
    this.isSelectingObjects = false;

    // Create a new empty layer using the new grid size
    this.addLayer();
  }

  preload() {
    //OBJECT
    this.load.image("boulder", "assets/objects/boulder.webp");

    //GRASS

    this.load.image("short-grass", "assets/terrain/grass/shortGrass.png");
    this.load.image("tall-grass", "assets/terrain/grass/tallGrass.png");

    //WATER

    this.load.image("water-center", "assets/terrain/water/waterCenter.png");
    this.load.image("water-top", "assets/terrain/water/waterTop.png");
    this.load.image("water-left", "assets/terrain/water/waterLeft.png");
    this.load.image("water-right", "assets/terrain/water/waterRight.png");
    this.load.image("water-bottom", "assets/terrain/water/waterBottom.png");
    this.load.image(
      "water-top-right",
      "assets/terrain/water/waterTopRight.png",
    );
    this.load.image("water-top-left", "assets/terrain/water/waterTopLeft.png");
    this.load.image(
      "water-bottom-right",
      "assets/terrain/water/waterBottomRight.png",
    );
    this.load.image(
      "water-bottom-left",
      "assets/terrain/water/waterBottomLeft.png",
    );
    this.load.image(
      "water-river-horizontal",
      "assets/terrain/water/waterRiverHorizontal.png",
    );
    this.load.image(
      "water-river-vertical",
      "assets/terrain/water/waterRiverVertical.png",
    );
    this.load.image(
      "water-inner-top-left",
      "assets/terrain/water/waterInnerTopLeft.png",
    );
    this.load.image(
      "water-inner-top-right",
      "assets/terrain/water/waterInnerTopRight.png",
    );
    this.load.image(
      "water-inner-bottom-left",
      "assets/terrain/water/waterInnerBottomLeft.png",
    );
    this.load.image(
      "water-inner-bottom-right",
      "assets/terrain/water/waterInnerBottomRight.png",
    );

    //SAND

    this.load.image("sand-center", "assets/terrain/sand/sandCenter.png");
    this.load.image("sand-top", "assets/terrain/sand/sandTop.png");
    this.load.image("sand-bottom", "assets/terrain/sand/sandBottom.png");
    this.load.image("sand-left", "assets/terrain/sand/sandLeft.png");
    this.load.image("sand-right", "assets/terrain/sand/sandRight.png");
    this.load.image("sand-top-left", "assets/terrain/sand/sandTopLeft.png");
    this.load.image("sand-top-right", "assets/terrain/sand/sandTopRight.png");
    this.load.image(
      "sand-bottom-left",
      "assets/terrain/sand/sandBottomLeft.png",
    );
    this.load.image(
      "sand-bottom-right",
      "assets/terrain/sand/sandBottomRight.png",
    );
    this.load.image("sand-vertical", "assets/terrain/sand/sandVertical.png");
    this.load.image(
      "sand-horizontal",
      "assets/terrain/sand/sandHorizontal.png",
    );
    this.load.image(
      "sand-inner-top-left",
      "assets/terrain/sand/sandCurveLeft.png",
    );
    this.load.image(
      "sand-inner-top-right",
      "assets/terrain/sand/sandCurveRight.png",
    );
    this.load.image(
      "sand-inner-bottom-left",
      "assets/terrain/sand/sandPitBottom.png",
    );
    this.load.image(
      "sand-inner-bottom-right",
      "assets/terrain/sand/sandPitTop.png",
    );
  }

  create() {
    this.addLayer();

    this.characterManager = new CharacterManager(
      this,
      (layer) => this.layerGraphics[layer],
      (row, column, layer) =>
        !this.objectManager.isCharacterMovementBlocked(row, column, layer),
      (row, column, layer) => {
        const layerGraphics = this.layerGraphics[layer];
        const scale = layerGraphics.scaleX;

        this.interactionManager.showInvalidTile(
          row,
          column,
          cellSize,
          layerGraphics.x,
          layerGraphics.y,
          scale,
        );
      },
      () => {
        this.interactionManager.clear();
      },
    );

    this.objectManager = new ObjectManager(
      this,
      (layer) => this.layerGraphics[layer],
      (row, column, layer) =>
        this.characterManager.getCharacterAt(row, column, layer) !== null,
    );

    this.interactionManager = new InteractionManager(this);
    this.terrainManager = new TerrainManager(this, (layer) =>
      this.getLayerOffset(layer),
    );
    this.previewGraphics = this.add.graphics();

    this.previewGraphics.setDepth(100);

    this.objectPreviewGraphics = this.add.graphics();

    this.objectPreviewGraphics.setDepth(101);

    this.updateLayerPositions();

    // POINTER EVENTS

    this.input.on("pointerdown", this.handlePointerDown.bind(this));

    this.input.on("pointermove", this.handlePointerMove.bind(this));

    this.input.on("pointerup", this.handlePointerUp.bind(this));

    //TERRAIN TOOL BUTTONS
    //GRASS TERRAIN BUTTON
    const grassButton = document.querySelector<HTMLButtonElement>(
      "#terrain-grass-button",
    );

    const grassMenu = document.querySelector<HTMLDivElement>(
      "#terrain-grass-menu",
    );

    if (grassButton && grassMenu) {
      const grassVariants = TERRAIN_VARIANTS.filter(
        (variant) => variant.category === "grass",
      );

      for (const variant of grassVariants) {
        const option = document.createElement("button");

        option.type = "button";
        option.className = "terrain-option";

        option.innerHTML = `
          <img
            src="${variant.assetPath}"
            alt="${variant.name}"
          />
          <span>${variant.name}</span>
        `;

        option.addEventListener("click", () => {
          this.selectedTerrain = variant;

          grassMenu.classList.remove("open");

          console.log(
            "Selected terrain:",
            variant.name,
            variant.width,
            "x",
            variant.height,
          );
        });

        grassMenu.appendChild(option);
      }

      grassButton.addEventListener("click", () => {
        grassMenu.classList.toggle("open");
      });
    }

    //WATER TERRAIN
    const waterButton = document.querySelector<HTMLButtonElement>(
      "#terrain-water-button",
    );

    const waterMenu = document.querySelector<HTMLDivElement>(
      "#terrain-water-menu",
    );

    if (waterButton && waterMenu) {
      const waterVariants = TERRAIN_VARIANTS.filter(
        (variant) => variant.category === "water",
      );

      for (const variant of waterVariants) {
        const option = document.createElement("button");

        option.type = "button";
        option.className = "terrain-option";

        option.innerHTML = `
          <img
            src="${variant.assetPath}"
            alt="${variant.name}"
          />
          <span>${variant.name}</span>
        `;

        option.addEventListener("click", () => {
          this.selectedTerrain = variant;

          waterMenu.classList.remove("open");

          console.log(
            "Selected terrain:",
            variant.name,
            variant.width,
            "x",
            variant.height,
          );
        });

        waterMenu.appendChild(option);
      }

      waterButton.addEventListener("click", () => {
        waterMenu.classList.toggle("open");
      });
    }

    //SAND TERRAIN BUTTON
    const sandButton = document.querySelector<HTMLButtonElement>(
      "#terrain-sand-button",
    );

    const sandMenu =
      document.querySelector<HTMLDivElement>("#terrain-sand-menu");

    if (sandButton && sandMenu) {
      const sandVariants = TERRAIN_VARIANTS.filter(
        (variant) => variant.category === "sand",
      );

      for (const variant of sandVariants) {
        const option = document.createElement("button");

        option.type = "button";
        option.className = "terrain-option";

        option.innerHTML = `
      <img
        src="${variant.assetPath}"
        alt="${variant.name}"
      />
      <span>${variant.name}</span>
    `;

        option.addEventListener("click", () => {
          this.selectedTerrain = variant;

          sandMenu.classList.remove("open");

          console.log(
            "Selected terrain:",
            variant.name,
            variant.width,
            "x",
            variant.height,
          );
        });

        sandMenu.appendChild(option);
      }

      sandButton.addEventListener("click", () => {
        sandMenu.classList.toggle("open");
      });
    }

    const toolButtons = document.querySelectorAll<HTMLButtonElement>(
      "#tools button, #character-bar button, #object-bar button[data-object-tool]",
    );

    toolButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tool = (button.dataset.tool ?? button.dataset.objectTool) as Tool;

        this.selectedTool = tool;

        if (tool !== "object-brush") {
          this.interactionManager.clear();
        }
      });
    });

    const eraseAllButton =
      document.querySelector<HTMLButtonElement>("#empty-all");

    eraseAllButton?.addEventListener("click", () => {
      this.terrainManager.clear();
    });

    // OBJECT TOOL BUTTONS

    const objectTypeButtons = document.querySelectorAll<HTMLButtonElement>(
      "#object-bar button[data-object-type]",
    );

    objectTypeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const objectType = button.dataset.objectType as MapObjectType;
        this.selectedObjectType = objectType;
      });
    });

    const eraseAllObjectsButton =
      document.querySelector<HTMLButtonElement>("#erase-all-objects");

    eraseAllObjectsButton?.addEventListener("click", () => {
      this.objectManager.removeAllObjects(this.currentLayer);
    });

    const objectSettingsButton =
      document.querySelector<HTMLButtonElement>("#object-settings");

    const objectSettingsApplyButton = document.querySelector<HTMLButtonElement>(
      "#object-settings-apply",
    );

    const objectSettingsCancelButton =
      document.querySelector<HTMLButtonElement>("#object-settings-cancel");

    const panel = document.querySelector<HTMLDivElement>(
      "#object-settings-panel",
    );

    objectSettingsCancelButton?.addEventListener("click", () => {
      if (!panel || !widthInput || !heightInput) {
        return;
      }

      widthInput.value = "1";
      heightInput.value = "1";

      if (objectSettingsError) {
        objectSettingsError.textContent = "";
        objectSettingsError.style.display = "none";
      }

      panel.style.display = "none";
    });

    const widthInput =
      document.querySelector<HTMLInputElement>("#object-width");

    const heightInput =
      document.querySelector<HTMLInputElement>("#object-height");

    const objectSettingsError = document.querySelector<HTMLParagraphElement>(
      "#object-settings-error",
    );

    objectSettingsButton?.addEventListener("click", () => {
      if (!panel || !widthInput || !heightInput) {
        return;
      }

      const selectedObject = this.objectManager.getSelectedObject();

      if (selectedObject) {
        widthInput.value = String(selectedObject.width);
        heightInput.value = String(selectedObject.height);
      } else {
        widthInput.value = String(this.selectedObjectWidth);
        heightInput.value = String(this.selectedObjectHeight);
      }

      if (objectSettingsError) {
        objectSettingsError.textContent = "";
        objectSettingsError.style.display = "none";
      }

      panel.style.display = "block";
    });

    objectSettingsApplyButton?.addEventListener("click", () => {
      if (!panel || !widthInput || !heightInput) {
        return;
      }

      const width = Number(widthInput.value);
      const height = Number(heightInput.value);

      // Clear previous error
      if (objectSettingsError) {
        objectSettingsError.style.display = "none";
        objectSettingsError.textContent = "";
      }

      const selectedObject = this.objectManager.getSelectedObject();

      const objectType = selectedObject
        ? selectedObject.type
        : this.selectedObjectType;

      const maxSize = this.objectManager.getMaxSize(objectType);

      // Invalid dimensions
      if (width < 1 || height < 1 || width > maxSize || height > maxSize) {
        if (objectSettingsError) {
          const objectName = this.objectManager.getObjectName(objectType);

          objectSettingsError.textContent = translations[
            getCurrentLanguage()
          ].invalidObjectDimensions
            .replace("{objectName}", objectName)
            .replace("{maxSize}", String(maxSize));

          objectSettingsError.style.display = "block";
        }

        return;
      }

      const validSize = this.objectManager.isValidObjectSize(
        objectType,
        width,
        height,
      );

      if (!validSize) {
        if (objectSettingsError) {
          const objectName = this.objectManager.getObjectName(objectType);
          const maxDifference =
            this.objectManager.getMaxSizeDifference(objectType);

          objectSettingsError.textContent = translations[
            getCurrentLanguage()
          ].invalidObjectProportions
            .replace("{objectName}", objectName)
            .replace("{maxDifference}", String(maxDifference));
          objectSettingsError.style.display = "block";
        }

        return;
      }

      if (selectedObject) {
        const canResize = this.objectManager.canPlaceObject(
          selectedObject.row,
          selectedObject.column,
          selectedObject.layer,
          width,
          height,
          selectedObject,
        );

        if (!canResize) {
          if (objectSettingsError) {
            objectSettingsError.textContent =
              translations[getCurrentLanguage()].invalidObjectSize;

            objectSettingsError.style.display = "block";
          }

          return;
        }

        const resized = this.objectManager.resizeSelectedObject(width, height);

        if (!resized) {
          // your existing error handling
          return;
        }

        this.objectManager.updateObjectPosition(selectedObject);
      }

      // Remember size for the next object
      this.selectedObjectWidth = width;
      this.selectedObjectHeight = height;

      panel.style.display = "none";
    });

    //CHARACTER TOOL BUTTONS
    const eraseAllCharactersButton = document.querySelector<HTMLButtonElement>(
      "#erase-all-characters",
    );

    eraseAllCharactersButton?.addEventListener("click", () => {
      this.characterManager.removeAllCharacters();
    });

    this.input.keyboard?.on("keydown-Z", (event: KeyboardEvent) => {
      if (!event.ctrlKey) {
        return;
      }

      if (
        this.selectedTool === "character-add" ||
        this.selectedTool === "character-select" ||
        this.selectedTool === "character-erase"
      ) {
        this.characterManager.undo();
        return;
      }

      if (
        this.selectedTool === "object-brush" ||
        this.selectedTool === "object-rectangle" ||
        this.selectedTool === "object-fill" ||
        this.selectedTool === "object-erase" ||
        this.selectedTool === "object-select"
      ) {
        this.objectManager.undo();
        return;
      }

      this.undoTerrain();
    });

    //MAP GRID TOOL
    const mapSizeButton =
      document.querySelector<HTMLButtonElement>("#map-size");

    const mapSizePanel =
      document.querySelector<HTMLDivElement>("#map-size-panel");

    const mapWidthInput =
      document.querySelector<HTMLInputElement>("#map-width-input");

    const mapHeightInput =
      document.querySelector<HTMLInputElement>("#map-height-input");

    const mapSizeApplyButton =
      document.querySelector<HTMLButtonElement>("#map-size-apply");

    const mapSizeCancelButton =
      document.querySelector<HTMLButtonElement>("#map-size-cancel");

    const mapSizeError =
      document.querySelector<HTMLDivElement>("#map-size-error");

    mapSizeButton?.addEventListener("click", () => {
      if (!mapSizePanel || !mapWidthInput || !mapHeightInput) {
        return;
      }

      mapWidthInput.value = String(gridWidth);
      mapHeightInput.value = String(gridHeight);

      if (mapSizeError) {
        mapSizeError.textContent = "";
        mapSizeError.style.display = "none";
      }

      mapSizePanel.style.display = "block";
    });

    mapSizeCancelButton?.addEventListener("click", () => {
      if (!mapSizePanel || !mapWidthInput || !mapHeightInput) {
        return;
      }

      mapWidthInput.value = String(gridWidth);
      mapHeightInput.value = String(gridHeight);

      if (mapSizeError) {
        mapSizeError.textContent = "";
        mapSizeError.style.display = "none";
      }

      mapSizePanel.style.display = "none";
    });

    mapSizeApplyButton?.addEventListener("click", () => {
      if (!mapSizePanel || !mapWidthInput || !mapHeightInput) {
        return;
      }

      const newWidth = Number(mapWidthInput.value);
      const newHeight = Number(mapHeightInput.value);

      const isValidDimension = (value: number) =>
        Number.isInteger(value) && value >= 5 && value % 5 === 0;

      if (!isValidDimension(newWidth) || !isValidDimension(newHeight)) {
        if (mapSizeError) {
          mapSizeError.textContent =
            translations[getCurrentLanguage()].invalidMapDimensions;

          mapSizeError.style.display = "block";
        }

        return;
      }

      if (newWidth === gridWidth && newHeight === gridHeight) {
        mapSizePanel.style.display = "none";
        return;
      }

      const confirmed = window.confirm(
        translations[getCurrentLanguage()].confirmMapResize,
      );
      if (!confirmed) {
        return;
      }

      setGridSize(newWidth, newHeight);

      mapSizePanel.style.display = "none";

      // Rebuild the map with the new grid size.
      this.resetMap();
    });

    this.input.keyboard?.on("keydown-Y", (event: KeyboardEvent) => {
      if (!event.ctrlKey) {
        return;
      }

      if (
        this.selectedTool === "character-add" ||
        this.selectedTool === "character-select" ||
        this.selectedTool === "character-erase"
      ) {
        this.characterManager.redo();
        return;
      }

      if (
        this.selectedTool === "object-brush" ||
        this.selectedTool === "object-rectangle" ||
        this.selectedTool === "object-fill" ||
        this.selectedTool === "object-erase" ||
        this.selectedTool === "object-select"
      ) {
        this.objectManager.redo();
        return;
      }

      this.redoTerrain();
    });

    const previousLayerButton =
      document.querySelector<HTMLButtonElement>("#previous-layer");

    const nextLayerButton =
      document.querySelector<HTMLButtonElement>("#next-layer");

    const addLayerButton =
      document.querySelector<HTMLButtonElement>("#add-layer");

    const removeLayerButton =
      document.querySelector<HTMLButtonElement>("#remove-layer");

    addLayerButton?.addEventListener("click", () => this.addLayer());

    removeLayerButton?.addEventListener("click", () => this.removeLayer());

    previousLayerButton?.addEventListener("click", () => this.previousLayer());

    nextLayerButton?.addEventListener("click", () => this.nextLayer());

    this.bringCurrentLayerToFront();
  }
}
