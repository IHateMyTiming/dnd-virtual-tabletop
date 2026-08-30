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

interface Tile {
  terrain: Terrain;
}

const gridSize = 30;
const cellSize = 24;
export class MapScene extends Phaser.Scene {
  private map: Tile[][] = [];
  private graphics!: Phaser.GameObjects.Graphics;
  private selectedTerrain: Terrain = "floor";
  private isPainting = false;

  constructor() {
    super("MapScene");
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

    this.graphics.lineStyle(1, 0x555555);

    for (let row = 0; row < gridSize; row++) {
      for (let column = 0; column < gridSize; column++) {
        const x = column * cellSize;
        const y = row * cellSize;

        this.graphics.strokeRect(x, y, cellSize, cellSize);
      }
    }
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.isPainting = true;
      this.paintTile(pointer);
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.isPainting && pointer.isDown) {
        this.paintTile(pointer);
      }
    });

    this.input.on("pointerup", () => {
      this.isPainting = false;
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
      for (let row = 0; row < gridSize; row++) {
        for (let column = 0; column < gridSize; column++) {
          this.map[row][column].terrain = "empty";
        }
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

    if (row >= 0 && row < gridSize && column >= 0 && column < gridSize) {
      this.map[row][column].terrain = this.selectedTerrain;

      this.drawTile(this.graphics, row, column);
    }
  }
}
