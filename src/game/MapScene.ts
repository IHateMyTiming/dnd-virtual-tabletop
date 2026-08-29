import Phaser from "phaser";
type Terrain = "empty" | "floor" | "wall" | "water";

interface Tile {
  terrain: Terrain;
}

const gridSize = 30;
const cellSize = 24;
export class MapScene extends Phaser.Scene {
  private map: Tile[][] = [];
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

    const graphics = this.add.graphics();

    graphics.lineStyle(1, 0x555555);

    for (let row = 0; row < gridSize; row++) {
      for (let column = 0; column < gridSize; column++) {
        const x = column * cellSize;
        const y = row * cellSize;

        graphics.strokeRect(x, y, cellSize, cellSize);
      }
    }
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const column = Math.floor(pointer.x / cellSize);
      const row = Math.floor(pointer.y / cellSize);

      if (row >= 0 && row < gridSize && column >= 0 && column < gridSize) {
        this.map[row][column].terrain = "floor";

        console.log(`Changed tile ${column}, ${row} to floor`);
      }
    });
  }
}
