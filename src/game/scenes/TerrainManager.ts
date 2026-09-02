import Phaser from "phaser";
import type { TerrainVariant } from "./TerrainObject";
import { gridWidth, gridHeight, cellSize } from "./Grid";

export interface TerrainObject {
  id: string;
  variantId: string;
  row: number;
  column: number;
  layer: number;
  width: number;
  height: number;
}

export class TerrainManager {
  private scene: Phaser.Scene;
  private terrainObjects: TerrainObject[] = [];
  private images: Map<string, Phaser.GameObjects.Image> = new Map();

  private getLayerOffset: (layer: number) => {
    offsetX: number;
    offsetY: number;
    scale: number;
  };

  constructor(
    scene: Phaser.Scene,
    getLayerOffset: (layer: number) => {
      offsetX: number;
      offsetY: number;
      scale: number;
    },
  ) {
    this.scene = scene;
    this.getLayerOffset = getLayerOffset;
  }

  public getTerrainObjects(): TerrainObject[] {
    return this.terrainObjects;
  }

  public canPlaceTerrain(
    row: number,
    column: number,
    width: number,
    height: number,
    layer: number,
  ): boolean {
    // Outside map
    if (
      row < 0 ||
      column < 0 ||
      row + height > gridHeight ||
      column + width > gridWidth
    ) {
      return false;
    }

    // Check overlap with existing terrain
    for (const terrain of this.terrainObjects) {
      if (terrain.layer !== layer) {
        continue;
      }

      const overlaps =
        row < terrain.row + terrain.height &&
        row + height > terrain.row &&
        column < terrain.column + terrain.width &&
        column + width > terrain.column;

      if (overlaps) {
        return false;
      }
    }

    return true;
  }

  public addTerrain(
    variant: TerrainVariant,
    row: number,
    column: number,
    layer: number,
  ): TerrainObject | null {
    if (
      !this.canPlaceTerrain(row, column, variant.width, variant.height, layer)
    ) {
      return null;
    }

    const terrain: TerrainObject = {
      id: crypto.randomUUID(),
      variantId: variant.id,
      row,
      column,
      layer,
      width: variant.width,
      height: variant.height,
    };

    this.terrainObjects.push(terrain);

    this.renderTerrain(terrain, variant);

    return terrain;
  }

  private renderTerrain(terrain: TerrainObject, variant: TerrainVariant): void {
    const { offsetX, offsetY, scale } = this.getLayerOffset(terrain.layer);

    const x =
      offsetX +
      terrain.column * cellSize * scale +
      (terrain.width * cellSize * scale) / 2;

    const y =
      offsetY +
      terrain.row * cellSize * scale +
      (terrain.height * cellSize * scale) / 2;

    const image = this.scene.add.image(x, y, variant.imageKey);

    image.setDisplaySize(
      terrain.width * cellSize * scale,
      terrain.height * cellSize * scale,
    );

    // Make sure terrain is above the grid graphics
    image.setDepth(1000 + terrain.layer);

    this.images.set(terrain.id, image);
  }

  public removeTerrain(id: string): TerrainObject | null {
    const index = this.terrainObjects.findIndex((terrain) => terrain.id === id);

    if (index === -1) {
      return null;
    }

    const terrain = this.terrainObjects[index];

    const image = this.images.get(id);

    if (image) {
      image.destroy();
      this.images.delete(id);
    }

    this.terrainObjects.splice(index, 1);

    return terrain;
  }

  public clear(): void {
    for (const image of this.images.values()) {
      image.destroy();
    }

    this.images.clear();
    this.terrainObjects = [];
  }
}
