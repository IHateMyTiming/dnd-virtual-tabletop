import Phaser from "phaser";

export class MapScene extends Phaser.Scene {
  constructor() {
    super("MapScene");
  }

  create() {
    const gridSize = 30;
    const cellSize = 24;

    const graphics = this.add.graphics();

    graphics.lineStyle(1, 0x555555);

    for (let row = 0; row < gridSize; row++) {
      for (let column = 0; column < gridSize; column++) {
        const x = column * cellSize;
        const y = row * cellSize;

        graphics.strokeRect(x, y, cellSize, cellSize);
      }
    }
  }
}
