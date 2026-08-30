import Phaser from "phaser";
import { CharacterManager } from "../characters/CharacterManager";

type Terrain =
  | "empty"
  | "floor"
  | "wall"
  | "water"
  | "grass"
  | "mud"
  | "lava"
  | "sand";

type Tool = "brush" | "rectangle" | "fill" | "character";

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

    // First tile
    if (this.lastPaintedRow === null || this.lastPaintedColumn === null) {
      const previousTerrain =
        this.layers[this.currentLayer][row][column].terrain;

      if (previousTerrain !== this.selectedTerrain) {
        this.currentAction?.changes.push({
          row,
          column,
          previousTerrain,
          newTerrain: this.selectedTerrain,
        });

        this.layers[this.currentLayer][row][column].terrain =
          this.selectedTerrain;

        this.drawTile(
          this.layerGraphics[this.currentLayer],
          this.currentLayer,
          row,
          column,
        );
      }

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

      const previousTerrain =
        this.layers[this.currentLayer][currentRow][currentColumn].terrain;

      if (previousTerrain !== this.selectedTerrain) {
        this.currentAction?.changes.push({
          row: currentRow,
          column: currentColumn,
          previousTerrain,
          newTerrain: this.selectedTerrain,
        });

        this.layers[this.currentLayer][currentRow][currentColumn].terrain =
          this.selectedTerrain;

        this.drawTile(
          this.layerGraphics[this.currentLayer],
          this.currentLayer,
          currentRow,
          currentColumn,
        );
      }
    }

    this.lastPaintedRow = row;
    this.lastPaintedColumn = column;
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
        const previousTerrain =
          this.layers[this.currentLayer][row][column].terrain;

        if (previousTerrain !== this.selectedTerrain) {
          this.currentAction?.changes.push({
            row,
            column,
            previousTerrain,
            newTerrain: this.selectedTerrain,
          });

          this.layers[this.currentLayer][row][column].terrain =
            this.selectedTerrain;

          this.drawTile(
            this.layerGraphics[this.currentLayer],
            this.currentLayer,
            row,
            column,
          );
        }
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

    const queue: Array<[number, number]> = [];
    queue.push([startRow, startColumn]);

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

  private undo() {
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

  private redo() {
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

  private redrawCurrentLayer() {
    this.updateLayerPositions();

    this.redrawLayer(this.currentLayer);

    this.bringCurrentLayerToFront();
  }

  private getLayerGraphics(layer: number) {
    return this.layerGraphics[layer];
  }

  private getLayerOffset(layer: number) {
    const difference = layer - this.currentLayer;

    // Current floor
    if (difference === 0) {
      return {
        offsetX: 120,
        offsetY: 0,
        scale: 1,
      };
    }

    // Previous floor
    if (difference === -1) {
      return {
        offsetX: 0,
        offsetY: 270,
        scale: 0.25,
      };
    }

    // Next floor
    if (difference === 1) {
      return {
        offsetX: 780,
        offsetY: 270,
        scale: 0.25,
      };
    }

    // Everything else is hidden
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

    graphics.lineStyle(1, 0x555555);

    for (let row = 0; row < gridSize; row++) {
      for (let column = 0; column < gridSize; column++) {
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
    const currentLayerElement =
      document.querySelector<HTMLSpanElement>("#current-layer");

    if (currentLayerElement) {
      currentLayerElement.textContent = String(this.currentLayer + 1);
    }
  }

  private getPointerTile(pointer: Phaser.Input.Pointer, layer: number) {
    const graphics = this.layerGraphics[layer];
    const scale = graphics.scaleX;
    const column = Math.floor((pointer.x - graphics.x) / (cellSize * scale));
    const row = Math.floor((pointer.y - graphics.y) / (cellSize * scale));
    return { row, column };
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

    console.log(`Selected layer: ${this.currentLayer + 1}`);
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

    // New layer becomes the current layer
    this.currentLayer = newLayerIndex;

    this.updateLayerPositions();
    this.bringCurrentLayerToFront();
    this.updateLayerCounter();
  }

  private removeLayer() {
    // Don't allow deleting the last layer
    if (this.layers.length <= 1) {
      return;
    }

    // Remove the CURRENT layer
    const graphics = this.layerGraphics.splice(this.currentLayer, 1)[0];

    if (graphics) {
      graphics.destroy();
    }

    this.layers.splice(this.currentLayer, 1);

    // If we deleted the last layer,
    // move to the new last layer
    if (this.currentLayer >= this.layers.length) {
      this.currentLayer = this.layers.length - 1;
    }

    this.updateLayerPositions();
    this.bringCurrentLayerToFront();
    this.updateLayerCounter();

    // Clear undo/redo because the layer structure changed
    this.undoStack = [];
    this.redoStack = [];
  }

  create() {
    // Create the first layer
    this.addLayer();

    // Create character manager
    this.characterManager = new CharacterManager(
      this,
      (layer) => this.layerGraphics[layer],
    );
    // Preview graphics
    this.previewGraphics = this.add.graphics();
    this.previewGraphics.setDepth(100);

    this.updateLayerPositions();

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const { row, column } = this.getPointerTile(pointer, this.currentLayer);

      if (row < 0 || row >= gridSize || column < 0 || column >= gridSize) {
        return;
      }

      // Character
      // Character
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

      //fill
      if (this.selectedTool === "fill") {
        this.fillTile(row, column);
        return;
      }

      //rectangle
      if (this.selectedTool === "rectangle") {
        this.isPainting = true;

        this.currentAction = {
          changes: [],
        };

        this.startPaintedRow = row;
        this.startPaintedColumn = column;

        return;
      }

      // Brush
      this.isPainting = true;

      this.currentAction = {
        changes: [],
      };

      this.lastPaintedRow = null;
      this.lastPaintedColumn = null;

      this.paintTile(pointer);
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
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

      if (!this.isPainting || !pointer.isDown) {
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
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (
        this.selectedTool === "character" &&
        this.characterManager.isDragging()
      ) {
        this.characterManager.stopDragging();
        return;
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

      if (
        this.currentAction !== null &&
        this.currentAction.changes.length > 0
      ) {
        this.undoStack.push(this.currentAction);
        this.redoStack = [];
      }

      this.currentAction = null;
      this.isPainting = false;

      this.lastPaintedRow = null;
      this.lastPaintedColumn = null;

      this.startPaintedRow = null;
      this.startPaintedColumn = null;
    });

    const buttons =
      document.querySelectorAll<HTMLButtonElement>("#toolbar button");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const terrain = button.dataset.terrain as Terrain;

        this.selectedTerrain = terrain;

        console.log(`Selected terrain: ${terrain}`);
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

    const toolButtons = document.querySelectorAll<HTMLButtonElement>(
      "#tools button, #character-bar button",
    );

    toolButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tool = button.dataset.tool as Tool;

        this.selectedTool = tool;

        console.log(`Selected tool: ${tool}`);
      });
    });

    this.input.keyboard?.on("keydown-Z", (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        this.undo();
      }
    });

    this.input.keyboard?.on("keydown-Y", (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        this.redo();
      }
    });

    const previousLayerButton =
      document.querySelector<HTMLButtonElement>("#previous-layer");

    const nextLayerButton =
      document.querySelector<HTMLButtonElement>("#next-layer");

    const addLayerButton =
      document.querySelector<HTMLButtonElement>("#add-layer");

    const removeLayerButton =
      document.querySelector<HTMLButtonElement>("#remove-layer");

    addLayerButton?.addEventListener("click", () => {
      this.addLayer();
    });

    removeLayerButton?.addEventListener("click", () => {
      this.removeLayer();
    });

    previousLayerButton?.addEventListener("click", () => {
      this.previousLayer();
    });

    nextLayerButton?.addEventListener("click", () => {
      this.nextLayer();
    });

    this.bringCurrentLayerToFront();
  }
}
