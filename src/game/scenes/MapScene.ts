import Phaser from "phaser";
import { CharacterManager } from "../characters/CharacterManager";
import { ObjectManager } from "./ObjectManager";
import type { MapObjectType } from "./MapObjects";
import type { MapObject } from "./MapObjects";
import type { Character } from "../characters/Character";
import { InteractionManager } from "../input/InteractionManager";
import { translations, getCurrentLanguage } from "../translation/translation";
import { gridWidth, gridHeight, setGridSize, cellSize } from "./Grid";
import { TerrainManager, type TerrainObject } from "./TerrainManager";
import { TERRAIN_VARIANTS, type TerrainVariant } from "./TerrainObject";
import { MapHistory, type MapSnapshot } from "./MapHistory";
import type { MapSaveData } from "../save/MapSave";

type Tool =
  | "brush"
  | "rectangle"
  | "fill"
  | "terrain-erase"
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
export class MapScene extends Phaser.Scene {
  constructor() {
    super("MapScene");
  }

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

  private mapHistory = new MapHistory<TerrainObject, MapObject, Character>();
  private mapActionStart: MapSnapshot<
    TerrainObject,
    MapObject,
    Character
  > | null = null;

  private createMapSnapshot(): MapSnapshot<
    TerrainObject,
    MapObject,
    Character
  > {
    return {
      terrains: this.terrainManager.getTerrainObjects(),
      objects: this.objectManager.getObjects(),
      characters: this.characterManager.getCharacters(),
    };
  }

  private restoreMapSnapshot(
    snapshot: MapSnapshot<TerrainObject, MapObject, Character>,
  ): void {
    this.terrainManager.restore(snapshot.terrains, (variantId) =>
      TERRAIN_VARIANTS.find((variant) => variant.id === variantId),
    );

    this.objectManager.restoreObjects(snapshot.objects);

    this.characterManager.restoreCharacters(snapshot.characters);

    this.terrainManager.updateAllTerrainPositions((variantId) =>
      TERRAIN_VARIANTS.find((variant) => variant.id === variantId),
    );

    this.objectManager.updateAllObjectPositions();
  }

  private beginMapAction(): void {
    this.mapActionStart = this.createMapSnapshot();
  }

  private finishMapAction(): void {
    if (!this.mapActionStart) {
      return;
    }

    const before = this.mapActionStart;
    const after = this.createMapSnapshot();

    if (JSON.stringify(before) !== JSON.stringify(after)) {
      this.mapHistory.push(before);
    }

    this.mapActionStart = null;
  }

  private undoMap(): void {
    const current = this.createMapSnapshot();
    const snapshot = this.mapHistory.undo(current);

    if (!snapshot) {
      return;
    }

    this.restoreMapSnapshot(snapshot);
  }

  private redoMap(): void {
    const current = this.createMapSnapshot();
    const snapshot = this.mapHistory.redo(current);

    if (!snapshot) {
      return;
    }

    this.restoreMapSnapshot(snapshot);
  }

  private createSaveData(): MapSaveData {
    const snapshot = this.createMapSnapshot();

    return {
      version: 1,

      gridWidth,
      gridHeight,

      currentLayer: this.currentLayer,
      layerCount: this.layers.length,

      terrains: snapshot.terrains,
      objects: snapshot.objects,
      characters: snapshot.characters,
    };
  }

  private saveMap(): void {
    const saveData = this.createSaveData();

    const json = JSON.stringify(saveData, null, 2);

    const blob = new Blob([json], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "dnd-map.json";

    link.click();

    URL.revokeObjectURL(url);
  }

  private loadMap(): void {
    const input = document.querySelector<HTMLInputElement>("#load-map-input");

    if (!input) return;

    input.value = "";

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      try {
        const text = await file.text();
        const saveData: MapSaveData = JSON.parse(text);

        // Basic validation
        if (
          saveData.version !== 1 ||
          !Number.isInteger(saveData.gridWidth) ||
          !Number.isInteger(saveData.gridHeight) ||
          !Number.isInteger(saveData.currentLayer) ||
          !Number.isInteger(saveData.layerCount) ||
          !Array.isArray(saveData.terrains) ||
          !Array.isArray(saveData.objects) ||
          !Array.isArray(saveData.characters)
        ) {
          throw new Error("Invalid map file.");
        }

        if (
          saveData.gridWidth < 5 ||
          saveData.gridWidth > 100 ||
          saveData.gridHeight < 5 ||
          saveData.gridHeight > 100 ||
          saveData.gridWidth % 5 !== 0 ||
          saveData.gridHeight % 5 !== 0
        ) {
          throw new Error("Invalid map size.");
        }

        if (
          saveData.layerCount < 1 ||
          saveData.currentLayer < 0 ||
          saveData.currentLayer >= saveData.layerCount
        ) {
          throw new Error("Invalid layer data.");
        }

        console.log("Loading map:", saveData);

        // Change grid size
        const gridChanged =
          saveData.gridWidth !== gridWidth ||
          saveData.gridHeight !== gridHeight;

        if (gridChanged) {
          const success = setGridSize(saveData.gridWidth, saveData.gridHeight);

          if (!success) {
            throw new Error("Failed to change grid size.");
          }
        }

        // Remove existing layer graphics
        for (const graphics of this.layerGraphics) {
          graphics.destroy();
        }

        this.layerGraphics = [];
        this.layers = [];

        // Clear map content
        this.characterManager.removeAllCharacters();
        this.objectManager.clearAllObjects();
        this.terrainManager.clear();

        // Reset layer state
        this.currentLayer = 0;

        // Recreate layers
        for (let i = 0; i < saveData.layerCount; i++) {
          this.addLayer();
        }

        // Restore terrain
        this.terrainManager.restore(saveData.terrains, (variantId) =>
          TERRAIN_VARIANTS.find((variant) => variant.id === variantId),
        );

        // Restore objects
        this.objectManager.restoreObjects(saveData.objects);

        // Restore characters
        this.characterManager.restoreCharacters(saveData.characters);

        // Restore current layer
        this.currentLayer = saveData.currentLayer;

        // Update everything visually
        this.updateLayerPositions();
        this.bringCurrentLayerToFront();

        this.terrainManager.updateAllTerrainPositions((variantId) =>
          TERRAIN_VARIANTS.find((variant) => variant.id === variantId),
        );

        this.objectManager.updateAllObjectPositions();

        this.characterManager.updateAllCharacterPositions();

        this.updateLayerCounter();

        // Loading creates a new history state
        this.mapHistory.clear();
        this.mapActionStart = null;

        console.log("Map loaded successfully.");
      } catch (error) {
        console.error("Failed to load map:", error);
        alert("Failed to load map.");
      }
    };

    input.click();
  }

  private drawTile(
    graphics: Phaser.GameObjects.Graphics,
    row: number,
    column: number,
  ) {
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

    // Brush cannot paint over existing terrain.
    const existing = this.terrainManager.getTerrainAt(
      row,
      column,
      this.currentLayer,
    );

    if (existing) {
      return;
    }

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
        const existing = this.terrainManager.getTerrainAt(
          row,
          column,
          this.currentLayer,
        );

        if (existing) {
          continue;
        }

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

  private fillTile(startRow: number, startColumn: number): void {
    const variant = this.selectedTerrain;

    // Multi-cell terrain cannot currently be flood-filled.
    if (variant.width !== 1 || variant.height !== 1) {
      return;
    }

    const startTerrain = this.terrainManager.getTerrainAt(
      startRow,
      startColumn,
      this.currentLayer,
    );

    const startVariantId = startTerrain?.variantId ?? null;

    const queue: Array<[number, number]> = [[startRow, startColumn]];

    const visited = new Set<string>();

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

      const terrain = this.terrainManager.getTerrainAt(
        row,
        column,
        this.currentLayer,
      );

      const terrainVariantId = terrain?.variantId ?? null;

      if (terrainVariantId !== startVariantId) {
        continue;
      }

      if (terrain?.variantId === variant.id) {
        queue.push([row - 1, column]);
        queue.push([row + 1, column]);
        queue.push([row, column - 1]);
        queue.push([row, column + 1]);

        continue;
      }

      if (terrain) {
        this.terrainManager.removeTerrain(terrain.id);
      }

      this.terrainManager.addTerrain(variant, row, column, this.currentLayer);

      queue.push([row - 1, column]);
      queue.push([row + 1, column]);
      queue.push([row, column - 1]);
      queue.push([row, column + 1]);
    }
  }

  private getLayerOffset(layer: number) {
    const difference = layer - this.currentLayer;

    // Current layer
    if (difference === 0) {
      return {
        offsetX: 0,
        offsetY: 0,
        scale: 1,
      };
    }

    // Hide all other layers for now.
    // The side-layer preview will be implemented
    // when we finish the interface.
    return {
      offsetX: -10000,
      offsetY: 0,
      scale: 1,
    };
  }

  private updateLayerPositions() {
    for (let layer = 0; layer < this.layerGraphics.length; layer++) {
      const graphics = this.layerGraphics[layer];

      const { offsetX, offsetY, scale } = this.getLayerOffset(layer);

      graphics.setPosition(offsetX, offsetY);
      graphics.setScale(scale);
    }
  }

  private redrawLayer(layer: number) {
    const graphics = this.layerGraphics[layer];

    graphics.clear();

    for (let row = 0; row < gridHeight; row++) {
      for (let column = 0; column < gridWidth; column++) {
        this.drawTile(graphics, row, column);
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

    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

    const scale = graphics.scaleX;

    const column = Math.floor((worldPoint.x - graphics.x) / (cellSize * scale));

    const row = Math.floor((worldPoint.y - graphics.y) / (cellSize * scale));

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

    this.terrainManager.updateAllTerrainPositions((variantId) =>
      TERRAIN_VARIANTS.find((variant) => variant.id === variantId),
    );

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

    this.terrainManager.updateAllTerrainPositions((variantId) =>
      TERRAIN_VARIANTS.find((variant) => variant.id === variantId),
    );
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (
      this.selectedTool === "object-select" &&
      this.objectManager.isPointerOnMoveHandle(pointer)
    ) {
      this.beginMapAction();

      this.objectManager.startMovingSelectedObject(pointer);

      return;
    }

    const { row, column } = this.getPointerTile(pointer, this.currentLayer);

    if (row < 0 || row >= gridHeight || column < 0 || column >= gridWidth) {
      return;
    }

    // CHARACTER ADD
    if (this.selectedTool === "character-add") {
      this.beginMapAction();

      this.characterManager.addCharacter(row, column, this.currentLayer);

      this.finishMapAction();

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
        this.beginMapAction();

        this.characterManager.startDragging(character);
      }

      return;
    }

    if (this.selectedTool === "character-erase") {
      this.beginMapAction();

      this.characterManager.eraseAt(row, column, this.currentLayer);

      this.finishMapAction();

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

      this.beginMapAction();

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

      this.beginMapAction();

      this.objectManager.eraseAt(row, column, this.currentLayer);

      return;
    }
    // TERRAIN FILL
    if (this.selectedTool === "fill") {
      this.beginMapAction();

      this.fillTile(row, column);

      this.finishMapAction();

      return;
    }

    if (this.selectedTool === "rectangle") {
      this.isPainting = true;

      this.beginMapAction();

      this.startPaintedRow = row;
      this.startPaintedColumn = column;

      return;
    }

    // OBJECT RECTANGLE
    if (this.selectedTool === "object-rectangle") {
      this.objectIsPainting = true;

      this.beginMapAction();

      this.objectStartRow = row;
      this.objectStartColumn = column;

      return;
    }

    // OBJECT FILL
    if (this.selectedTool === "object-fill") {
      this.beginMapAction();

      this.objectManager.fill(
        row,
        column,
        this.currentLayer,
        this.selectedObjectType,
        this.selectedObjectWidth,
        this.selectedObjectHeight,
      );

      this.finishMapAction();

      return;
    }

    // TERRAIN BRUSH
    if (this.selectedTool === "brush") {
      this.isPainting = true;

      this.beginMapAction();

      this.lastPaintedRow = null;
      this.lastPaintedColumn = null;

      this.paintTile(pointer);

      return;
    }

    if (this.selectedTool === "terrain-erase") {
      this.isPainting = true;

      this.beginMapAction();

      this.terrainManager.eraseAt(row, column, this.currentLayer);

      this.lastPaintedRow = row;
      this.lastPaintedColumn = column;

      return;
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

    if (
      this.selectedTool === "terrain-erase" &&
      this.isPainting &&
      pointer.isDown
    ) {
      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      if (row >= 0 && row < gridHeight && column >= 0 && column < gridWidth) {
        this.terrainManager.eraseAt(row, column, this.currentLayer);
      }

      return;
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer) {
    if (
      this.selectedTool === "object-select" &&
      this.objectManager.isMovingSelectedObject()
    ) {
      this.objectManager.stopMovingSelectedObject();

      this.finishMapAction();

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

      this.finishMapAction();

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

    if (this.mapActionStart !== null) {
      this.finishMapAction();
    }

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

    // Clear characters, objects and terrain
    this.characterManager.removeAllCharacters();
    this.objectManager.clearAllObjects();
    this.terrainManager.clear();

    // Reset map state
    this.currentLayer = 0;

    this.mapHistory.clear();
    this.mapActionStart = null;

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
      "sand-inner-bottom-left",
      "assets/terrain/sand/sandPitBottom.png",
    );
    this.load.image(
      "sand-inner-bottom-right",
      "assets/terrain/sand/sandPitTop.png",
    );

    //MUD
    this.load.image("mud", "assets/terrain/mud/mud.png");

    //LAVA
    this.load.image("lava-center", "assets/terrain/lava/lavaCenter.png");
    this.load.image("lava-top", "assets/terrain/lava/lavaTop.png");
    this.load.image("lava-bottom", "assets/terrain/lava/lavaBottom.png");
    this.load.image("lava-left", "assets/terrain/lava/lavaLeft.png");
    this.load.image("lava-right", "assets/terrain/lava/lavaRight.png");
    this.load.image("lava-top-left", "assets/terrain/lava/lavaTopLeft.png");
    this.load.image("lava-top-right", "assets/terrain/lava/lavaTopRight.png");
    this.load.image(
      "lava-bottom-right",
      "assets/terrain/lava/lavaBottomRight.png",
    );
    this.load.image(
      "lava-bottom-left",
      "assets/terrain/lava/lavaBottomLeft.png",
    );

    //FLOOR
    this.load.image("floor-brick", "assets/terrain/floor/brick.png");
    this.load.image("floor-bridge", "assets/terrain/floor/bridge.png");
    this.load.image("floor-concrete", "assets/terrain/floor/concrete.png");
    this.load.image("floor-japanese", "assets/terrain/floor/japanese.png");
    this.load.image("floor-rock", "assets/terrain/floor/rock.png");
    this.load.image("floor-rock2", "assets/terrain/floor/rock2.png");
    this.load.image("floor-rock3", "assets/terrain/floor/rock3.png");
    this.load.image("floor-rock4", "assets/terrain/floor/rock4.png");
    this.load.image("floor-rock5", "assets/terrain/floor/rock5.png");
    this.load.image("floor-wood1", "assets/terrain/floor/wood1.png");
    this.load.image("floor-wood2", "assets/terrain/floor/wood2.png");
    this.load.image("floor-dungeon1", "assets/terrain/floor/dungeon1.png");
    this.load.image("floor-dungeon2", "assets/terrain/floor/dungeon2.png");

    //Character SPRITES
    //HEAD
    this.load.image(
      "character-head-human-white-brown",
      "assets/characters/heads/headHumanWhiteBrown.png",
    );
    //BODY
    this.load.image(
      "character-body-human-green-tunic",
      "assets/characters/bodies/bodyHumanGreenTunic.png",
    );
    //CAPE
    this.load.image(
      "character-cape-human-white-red",
      "assets/characters/capes/capeHumanWhiteRed.png",
    );
    // EQUIPMENT
    this.load.image(
      "character-equipment-sword",
      "assets/characters/equipments/sword.png",
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
        });

        sandMenu.appendChild(option);
      }

      sandButton.addEventListener("click", () => {
        sandMenu.classList.toggle("open");
      });
    }

    //MUD TERRAIN BUTTON

    const mud = document.querySelector<HTMLButtonElement>(
      "#terrain-mud-button",
    );

    const mudMenu = document.querySelector<HTMLDivElement>("#terrain-mud-menu");

    if (mud && mudMenu) {
      const mudVariants = TERRAIN_VARIANTS.filter(
        (variant) => variant.category === "mud",
      );

      for (const variant of mudVariants) {
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

          mudMenu.classList.remove("open");
        });

        mudMenu.appendChild(option);
      }

      mud.addEventListener("click", () => {
        mudMenu.classList.toggle("open");
      });
    }

    //LAVA TERRAIN BUTTON

    const lava = document.querySelector<HTMLButtonElement>(
      "#terrain-lava-button",
    );

    const lavaMenu =
      document.querySelector<HTMLDivElement>("#terrain-lava-menu");

    if (lava && lavaMenu) {
      const lavaVariants = TERRAIN_VARIANTS.filter(
        (variant) => variant.category === "lava",
      );

      for (const variant of lavaVariants) {
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

          lavaMenu.classList.remove("open");
        });

        lavaMenu.appendChild(option);
      }

      lava.addEventListener("click", () => {
        lavaMenu.classList.toggle("open");
      });
    }

    //FLOOR

    const floor = document.querySelector<HTMLButtonElement>(
      "#terrain-floor-button",
    );

    const floorMenu = document.querySelector<HTMLDivElement>(
      "#terrain-floor-menu",
    );

    if (floor && floorMenu) {
      const floorVariants = TERRAIN_VARIANTS.filter(
        (variant) => variant.category === "floor",
      );

      for (const variant of floorVariants) {
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

          floorMenu.classList.remove("open");
        });

        floorMenu.appendChild(option);
      }

      floor.addEventListener("click", () => {
        floorMenu.classList.toggle("open");
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

    const terrainEraseButton =
      document.querySelector<HTMLButtonElement>("#terrain-erase");

    terrainEraseButton?.addEventListener("click", () => {
      this.selectedTool = "terrain-erase";
      this.interactionManager.clear();
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

        this.beginMapAction();

        const resized = this.objectManager.resizeSelectedObject(width, height);

        this.finishMapAction();
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

      this.undoMap();
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

      this.redoMap();
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

    //Game save
    const saveMapButton =
      document.querySelector<HTMLButtonElement>("#save-map");

    saveMapButton?.addEventListener("click", () => {
      this.saveMap();
    });

    //Load game
    const loadMapButton =
      document.querySelector<HTMLButtonElement>("#load-map");

    loadMapButton?.addEventListener("click", () => {
      this.loadMap();
    });

    const camera = this.cameras.main;

    camera.setZoom(1);

    camera.setBounds(0, 0, gridWidth * cellSize, gridHeight * cellSize);

    this.input.on(
      "wheel",
      (
        pointer: Phaser.Input.Pointer,
        _gameObjects: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
      ) => {
        const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);

        const zoomStep = 0.1;

        let newZoom = camera.zoom;

        if (deltaY < 0) {
          newZoom += zoomStep;
        } else if (deltaY > 0) {
          newZoom -= zoomStep;
        }

        newZoom = Phaser.Math.Clamp(newZoom, 0.5, 2);

        if (newZoom === camera.zoom) {
          return;
        }

        camera.setZoom(newZoom);

        const newWorldPoint = camera.getWorldPoint(pointer.x, pointer.y);

        camera.scrollX += worldPoint.x - newWorldPoint.x;
        camera.scrollY += worldPoint.y - newWorldPoint.y;
      },
    );
  }
}
