import Phaser from "phaser";
type Terrain =
  | "empty"
  | "floor"
  | "wall"
  | "water"
  | "grass"
  | "mud"
  | "lava"
  | "sand";

type Tool = "brush" | "rectangle" | "fill";

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
  private map: Tile[][] = [];
  private graphics!: Phaser.GameObjects.Graphics;
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

  constructor() {
    super("MapScene");
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
        const previousTerrain = this.map[row][column].terrain;

        if (previousTerrain !== this.selectedTerrain) {
          this.currentAction?.changes.push({
            row,
            column,
            previousTerrain,
            newTerrain: this.selectedTerrain,
          });

          this.map[row][column].terrain = this.selectedTerrain;

          this.drawTile(this.graphics, row, column);
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

    const x = minColumn * cellSize;
    const y = minRow * cellSize;

    const width = (maxColumn - minColumn + 1) * cellSize;
    const height = (maxRow - minRow + 1) * cellSize;

    this.previewGraphics.fillStyle(0xffffff, 0.2);
    this.previewGraphics.fillRect(x, y, width, height);

    this.previewGraphics.lineStyle(2, 0xffffff, 0.8);
    this.previewGraphics.strokeRect(x, y, width, height);
  }

  private fillTile(startRow: number, startColumn: number) {
    const originalTerrain = this.map[startRow][startColumn].terrain;
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

      if (this.map[row][column].terrain !== originalTerrain) {
        continue;
      }

      action.changes.push({
        row,
        column,
        previousTerrain: originalTerrain,
        newTerrain,
      });

      this.map[row][column].terrain = newTerrain;

      this.drawTile(this.graphics, row, column);

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
      this.map[change.row][change.column].terrain = change.previousTerrain;

      this.drawTile(this.graphics, change.row, change.column);
    }

    this.redoStack.push(action);
  }

  private redo() {
    const action = this.redoStack.pop();

    if (!action) {
      return;
    }

    for (const change of action.changes) {
      this.map[change.row][change.column].terrain = change.newTerrain;

      this.drawTile(this.graphics, change.row, change.column);
    }

    this.undoStack.push(action);
  }

  create() {
    for (let row = 0; row < gridSize; row++) {
      this.map[row] = [];

      for (let column = 0; column < gridSize; column++) {
        this.map[row][column] = {
          terrain: "empty",
        };
      }
    }

    this.graphics = this.add.graphics();
    this.previewGraphics = this.add.graphics();

    this.graphics.lineStyle(1, 0x555555);

    for (let row = 0; row < gridSize; row++) {
      for (let column = 0; column < gridSize; column++) {
        const x = column * cellSize;
        const y = row * cellSize;

        this.graphics.strokeRect(x, y, cellSize, cellSize);
      }
    }
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const column = Math.floor(pointer.x / cellSize);
      const row = Math.floor(pointer.y / cellSize);

      if (row < 0 || row >= gridSize || column < 0 || column >= gridSize) {
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
        const column = Math.floor(pointer.x / cellSize);
        const row = Math.floor(pointer.y / cellSize);

        this.drawRectanglePreview(
          this.startPaintedRow,
          this.startPaintedColumn,
          row,
          column,
        );
      }
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (!this.isPainting) {
        return;
      }

      if (
        this.selectedTool === "rectangle" &&
        this.startPaintedRow !== null &&
        this.startPaintedColumn !== null
      ) {
        const column = Math.floor(pointer.x / cellSize);
        const row = Math.floor(pointer.y / cellSize);

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
          const previousTerrain = this.map[row][column].terrain;

          if (previousTerrain !== "empty") {
            action.changes.push({
              row,
              column,
              previousTerrain,
              newTerrain: "empty",
            });

            this.map[row][column].terrain = "empty";
          }
        }
      }

      if (action.changes.length > 0) {
        this.undoStack.push(action);
        this.redoStack = [];
      }

      this.graphics.clear();

      this.graphics.lineStyle(1, 0x555555);

      for (let row = 0; row < gridSize; row++) {
        for (let column = 0; column < gridSize; column++) {
          const x = column * cellSize;
          const y = row * cellSize;

          this.graphics.strokeRect(x, y, cellSize, cellSize);
        }
      }
    });

    const toolButtons =
      document.querySelectorAll<HTMLButtonElement>("#tools button");

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
  }
  private drawTile(
    graphics: Phaser.GameObjects.Graphics,
    row: number,
    column: number,
  ) {
    const tile = this.map[row][column];

    const x = column * cellSize;
    const y = row * cellSize;

    // Clear the tile
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

    // Draw the grid line again
    graphics.lineStyle(1, 0x555555);
    graphics.strokeRect(x, y, cellSize, cellSize);
  }

  private paintTile(pointer: Phaser.Input.Pointer) {
    const column = Math.floor(pointer.x / cellSize);
    const row = Math.floor(pointer.y / cellSize);

    if (row < 0 || row >= gridSize || column < 0 || column >= gridSize) {
      return;
    }

    // First tile
    if (this.lastPaintedRow === null || this.lastPaintedColumn === null) {
      const previousTerrain = this.map[row][column].terrain;

      if (previousTerrain !== this.selectedTerrain) {
        this.currentAction?.changes.push({
          row,
          column,
          previousTerrain,
          newTerrain: this.selectedTerrain,
        });

        this.map[row][column].terrain = this.selectedTerrain;

        this.drawTile(this.graphics, row, column);
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

      const previousTerrain = this.map[currentRow][currentColumn].terrain;

      if (previousTerrain !== this.selectedTerrain) {
        this.currentAction?.changes.push({
          row: currentRow,
          column: currentColumn,
          previousTerrain,
          newTerrain: this.selectedTerrain,
        });

        this.map[currentRow][currentColumn].terrain = this.selectedTerrain;

        this.drawTile(this.graphics, currentRow, currentColumn);
      }
    }

    this.lastPaintedRow = row;
    this.lastPaintedColumn = column;
  }
}
