import Phaser from "phaser";
import { CharacterManager } from "../characters/CharacterManager";
import { ObjectManager } from "./ObjectManager";
import type { MapObjectType } from "./MapObjects";
import { InteractionManager } from "../input/InteractionManager";

type Terrain =
  | "empty"
  | "floor"
  | "wall"
  | "water"
  | "grass"
  | "mud"
  | "lava"
  | "sand";

type Tool =
  | "brush"
  | "rectangle"
  | "fill"
  | "character"
  | "character-erase"
  | "object-brush"
  | "object-rectangle"
  | "object-fill"
  | "object-erase"
  | "object-select";

interface Tile {
  terrain: Terrain;
}

interface TileChange {
  row: number;
  column: number;
  previousTerrain: Terrain;
  newTerrain: Terrain;
}

interface MapAction {
  changes: TileChange[];
}

const gridSize = 30;
const cellSize = 24;

export class MapScene extends Phaser.Scene {
  private layers: Tile[][][] = [];
  private currentLayer = 0;

  private layerGraphics: Phaser.GameObjects.Graphics[] = [];

  private previewGraphics!: Phaser.GameObjects.Graphics;
  private objectPreviewGraphics!: Phaser.GameObjects.Graphics;

  private selectedTerrain: Terrain = "floor";
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

  private interactionManager!: InteractionManager;

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

    graphics.fillStyle(0x1e1e1e);
    graphics.fillRect(x, y, cellSize, cellSize);

    if (tile.terrain === "floor") {
      graphics.fillStyle(0xaaaaaa);
      graphics.fillRect(x, y, cellSize, cellSize);
    }

    if (tile.terrain === "wall") {
      graphics.fillStyle(0x555555);
      graphics.fillRect(x, y, cellSize, cellSize);
    }

    if (tile.terrain === "water") {
      graphics.fillStyle(0x3366aa);
      graphics.fillRect(x, y, cellSize, cellSize);
    }

    if (tile.terrain === "grass") {
      graphics.fillStyle(0x7cfc00);
      graphics.fillRect(x, y, cellSize, cellSize);
    }

    if (tile.terrain === "mud") {
      graphics.fillStyle(0x6b4423);
      graphics.fillRect(x, y, cellSize, cellSize);
    }

    if (tile.terrain === "lava") {
      graphics.fillStyle(0xa83232);
      graphics.fillRect(x, y, cellSize, cellSize);
    }

    if (tile.terrain === "sand") {
      graphics.fillStyle(0xd6b83d);
      graphics.fillRect(x, y, cellSize, cellSize);
    }

    graphics.lineStyle(1, 0x555555);

    graphics.strokeRect(x, y, cellSize, cellSize);
  }

  private paintTile(pointer: Phaser.Input.Pointer) {
    const { row, column } = this.getPointerTile(pointer, this.currentLayer);

    if (row < 0 || row >= gridSize || column < 0 || column >= gridSize) {
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

  private paintSingleTile(row: number, column: number) {
    const previousTerrain = this.layers[this.currentLayer][row][column].terrain;

    if (previousTerrain === this.selectedTerrain) {
      return;
    }

    this.currentAction?.changes.push({
      row,
      column,
      previousTerrain,
      newTerrain: this.selectedTerrain,
    });

    this.layers[this.currentLayer][row][column].terrain = this.selectedTerrain;

    this.drawTile(
      this.layerGraphics[this.currentLayer],
      this.currentLayer,
      row,
      column,
    );
  }

  private fillRectangle(
    startRow: number,
    startColumn: number,
    endRow: number,
    endColumn: number,
  ) {
    const minRow = Math.max(0, Math.min(startRow, endRow));

    const maxRow = Math.min(gridSize - 1, Math.max(startRow, endRow));

    const minColumn = Math.max(0, Math.min(startColumn, endColumn));

    const maxColumn = Math.min(gridSize - 1, Math.max(startColumn, endColumn));

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

    const maxRow = Math.min(gridSize - 1, Math.max(startRow, endRow));

    const minColumn = Math.max(0, Math.min(startColumn, endColumn));

    const maxColumn = Math.min(gridSize - 1, Math.max(startColumn, endColumn));

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

      if (row < 0 || row >= gridSize || column < 0 || column >= gridSize) {
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

    for (let row = 0; row < gridSize; row++) {
      for (let column = 0; column < gridSize; column++) {
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

    for (let row = 0; row < gridSize; row++) {
      newLayer[row] = [];

      for (let column = 0; column < gridSize; column++) {
        newLayer[row][column] = {
          terrain: "empty",
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
    const { row, column } = this.getPointerTile(pointer, this.currentLayer);

    if (row < 0 || row >= gridSize || column < 0 || column >= gridSize) {
      return;
    }

    // CHARACTER
    if (this.selectedTool === "character") {
      const character = this.characterManager.getCharacterAt(
        row,
        column,
        this.currentLayer,
      );

      if (character) {
        this.characterManager.startDragging(character);
      } else {
        this.characterManager.addCharacter(row, column, this.currentLayer);
      }

      return;
    }

    if (this.selectedTool === "character-erase") {
      this.characterManager.eraseAt(row, column, this.currentLayer);

      return;
    }

    if (this.selectedTool === "object-select") {
      this.objectManager.selectObjectAt(row, column, this.currentLayer);

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
    if (this.selectedTool === "object-brush" && !this.objectIsPainting) {
      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      const { offsetX, offsetY, scale } = this.getLayerOffset(
        this.currentLayer,
      );

      const valid =
        row >= 0 &&
        row < gridSize &&
        column >= 0 &&
        column < gridSize &&
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
      this.selectedTool === "character" &&
      this.characterManager.isDragging()
    ) {
      if (!pointer.isDown) {
        return;
      }

      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      if (row >= 0 && row < gridSize && column >= 0 && column < gridSize) {
        this.characterManager.updateDraggingPosition(row, column);
      }

      return;
    }

    if (this.selectedTool === "object-erase" && this.objectIsPainting) {
      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      if (row >= 0 && row < gridSize && column >= 0 && column < gridSize) {
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

      if (row >= 0 && row < gridSize && column >= 0 && column < gridSize) {
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
    // CHARACTER
    if (
      this.selectedTool === "character" &&
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

  preload() {
    this.load.image("boulder", "assets/objects/boulder.webp");
  }

  create() {
    this.addLayer();

    this.characterManager = new CharacterManager(
      this,
      (layer) => this.layerGraphics[layer],
    );

    this.objectManager = new ObjectManager(
      this,
      (layer) => this.layerGraphics[layer],
    );

    this.interactionManager = new InteractionManager(this);

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
    const buttons =
      document.querySelectorAll<HTMLButtonElement>("#toolbar button");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const terrain = button.dataset.terrain as Terrain;

        this.selectedTerrain = terrain;
      });
    });

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

        console.log(`Selected tool: ${tool}`);
      });
    });

    const eraseAllButton =
      document.querySelector<HTMLButtonElement>("#empty-all");

    eraseAllButton?.addEventListener("click", () => {
      const action: MapAction = {
        changes: [],
      };

      for (let row = 0; row < gridSize; row++) {
        for (let column = 0; column < gridSize; column++) {
          const previousTerrain =
            this.layers[this.currentLayer][row][column].terrain;

          if (previousTerrain !== "empty") {
            action.changes.push({
              row,
              column,
              previousTerrain,
              newTerrain: "empty",
            });

            this.layers[this.currentLayer][row][column].terrain = "empty";
          }
        }
      }

      if (action.changes.length > 0) {
        this.undoStack.push(action);

        this.redoStack = [];
      }

      this.redrawLayer(this.currentLayer);
    });

    // OBJECT TOOL BUTTONS

    const objectTypeButtons = document.querySelectorAll<HTMLButtonElement>(
      "#object-bar button[data-object-type]",
    );

    objectTypeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const objectType = button.dataset.objectType as "boulder";

        this.selectedObjectType = objectType;

        console.log(`Selected object type: ${objectType}`);
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

    const widthInput =
      document.querySelector<HTMLInputElement>("#object-width");

    const heightInput =
      document.querySelector<HTMLInputElement>("#object-height");

    objectSettingsButton?.addEventListener("click", () => {
      if (!panel || !widthInput || !heightInput) {
        return;
      }

      if (panel.style.display === "block") {
        panel.style.display = "none";
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

      panel.style.display = "block";
    });

    objectSettingsApplyButton?.addEventListener("click", () => {
      if (!panel || !widthInput || !heightInput) {
        return;
      }

      const width = Number(widthInput.value);
      const height = Number(heightInput.value);

      if (width < 1 || height < 1) {
        return;
      }

      const selectedObject = this.objectManager.getSelectedObject();

      if (selectedObject) {
        selectedObject.width = width;
        selectedObject.height = height;

        this.objectManager.updateObjectPosition(selectedObject);
      }

      this.selectedObjectWidth = width;
      this.selectedObjectHeight = height;

      panel.style.display = "none";
    });

    objectSettingsCancelButton?.addEventListener("click", () => {
      if (panel) {
        panel.style.display = "none";
      }
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
        this.selectedTool === "character" ||
        this.selectedTool === "character-erase"
      ) {
        this.characterManager.undo();
        return;
      }

      if (
        this.selectedTool === "object-brush" ||
        this.selectedTool === "object-rectangle" ||
        this.selectedTool === "object-fill" ||
        this.selectedTool === "object-erase"
      ) {
        this.objectManager.undo();
        return;
      }

      this.undoTerrain();
    });

    this.input.keyboard?.on("keydown-Y", (event: KeyboardEvent) => {
      if (!event.ctrlKey) {
        return;
      }

      if (
        this.selectedTool === "character" ||
        this.selectedTool === "character-erase"
      ) {
        this.characterManager.redo();
        return;
      }

      if (
        this.selectedTool === "object-brush" ||
        this.selectedTool === "object-rectangle" ||
        this.selectedTool === "object-fill" ||
        this.selectedTool === "object-erase"
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
