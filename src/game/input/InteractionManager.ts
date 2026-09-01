import Phaser from "phaser";

export type InteractionState = "none" | "valid" | "invalid";

export class InteractionManager {
  private scene: Phaser.Scene;

  private indicatorGraphics: Phaser.GameObjects.Graphics;

  private state: InteractionState = "none";

  private cursorDefault = "default";
  private cursorInvalid = "not-allowed";

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.indicatorGraphics = scene.add.graphics();
    this.indicatorGraphics.setDepth(200);

    this.setState("none");
  }

  //Set the current interaction state.
  //"none" = no indicator
  //"valid" = valid position
  //"invalid" = cannot interact/place here

  setState(state: InteractionState) {
    this.state = state;
    this.indicatorGraphics.clear();
    const canvas = this.scene.game.canvas;

    if (state === "invalid") {
      canvas.style.cursor = this.cursorInvalid;
      return;
    }

    canvas.style.cursor = this.cursorDefault;
  }

  getState() {
    return this.state;
  }

  //Show an X at a specific map position.
  showInvalidTile(
    row: number,
    column: number,
    cellSize: number,
    offsetX: number,
    offsetY: number,
    scale = 1,
  ) {
    this.setState("invalid");
    const x = offsetX + column * cellSize * scale + (cellSize / 2) * scale;

    const y = offsetY + row * cellSize * scale + (cellSize / 2) * scale;

    const size = cellSize * scale * 0.35;

    this.indicatorGraphics.clear();

    this.indicatorGraphics.lineStyle(3, 0xff0000, 1);

    this.indicatorGraphics.beginPath();

    this.indicatorGraphics.moveTo(x - size, y - size);

    this.indicatorGraphics.lineTo(x + size, y + size);

    this.indicatorGraphics.moveTo(x + size, y - size);

    this.indicatorGraphics.lineTo(x - size, y + size);

    this.indicatorGraphics.strokePath();
  }

  //Show a valid interaction state.
  showValid() {
    this.setState("valid");
  }

  //Remove all interaction indicators and restore the normal cursor.
  clear() {
    this.setState("none");
  }

  //Change the cursor used for invalid interactions.
  setInvalidCursor(cursor: string) {
    this.cursorInvalid = cursor;
  }

  //Restore the browser cursor.
  resetCursor() {
    this.scene.game.canvas.style.cursor = this.cursorDefault;
  }

  destroy() {
    this.indicatorGraphics.destroy();

    this.scene.game.canvas.style.cursor = this.cursorDefault;
  }

  showObjectPlacementPreview(
    row: number,
    column: number,
    width: number,
    height: number,
    cellSize: number,
    offsetX: number,
    offsetY: number,
    scale: number,
    valid: boolean,
  ) {
    this.indicatorGraphics.clear();

    const x = offsetX + column * cellSize * scale;
    const y = offsetY + row * cellSize * scale;

    const previewWidth = width * cellSize * scale;
    const previewHeight = height * cellSize * scale;

    if (!valid) {
      this.setState("invalid");

      this.indicatorGraphics.fillStyle(0xff0000, 0.2);
      this.indicatorGraphics.fillRect(x, y, previewWidth, previewHeight);

      this.indicatorGraphics.lineStyle(3, 0xff0000, 1);

      this.indicatorGraphics.strokeRect(x, y, previewWidth, previewHeight);

      const centerX = x + previewWidth / 2;
      const centerY = y + previewHeight / 2;

      const size = Math.min(previewWidth, previewHeight) * 0.2;

      this.indicatorGraphics.beginPath();

      this.indicatorGraphics.moveTo(centerX - size, centerY - size);

      this.indicatorGraphics.lineTo(centerX + size, centerY + size);

      this.indicatorGraphics.moveTo(centerX + size, centerY - size);

      this.indicatorGraphics.lineTo(centerX - size, centerY + size);

      this.indicatorGraphics.strokePath();

      return;
    }

    this.setState("valid");

    this.indicatorGraphics.fillStyle(0xffffff, 0.15);

    this.indicatorGraphics.fillRect(x, y, previewWidth, previewHeight);

    this.indicatorGraphics.lineStyle(2, 0xffffff, 0.8);

    this.indicatorGraphics.strokeRect(x, y, previewWidth, previewHeight);
  }
}
