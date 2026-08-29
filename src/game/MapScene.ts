import Phaser from "phaser";
type Terrain = "empty" | "floor" | "wall" | "water";

interface Tile {
  terrain: Terrain;
}

const gridSize = 30;
const cellSize = 24;
export class MapScene extends Phaser.Scene {
  private map: Tile[][] = [];
  private graphics!: Phaser.GameObjects.Graphics;
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
      const column = Math.floor(pointer.x / cellSize);
      const row = Math.floor(pointer.y / cellSize);

      if (row >= 0 && row < gridSize && column >= 0 && column < gridSize) {
        this.map[row][column].terrain = "floor";

        this.drawTile(this.graphics, row, column);

        console.log(`Changed tile ${column}, ${row} to floor`);
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

    if (tile.terrain === "floor") {
      graphics.fillStyle(0xaaaaaa);
      graphics.fillRect(x, y, cellSize, cellSize);
    }

    if (tile.terrain === "wall") {
      graphics.fillStyle(0x555555);
      graphics.fillRect(x, y, cellSize, cellSize);
    }
  }
}
