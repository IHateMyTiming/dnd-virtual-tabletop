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
    return this.terrainObjects.map((terrain) => ({
      ...terrain,
    }));
  }

  public canPlaceTerrain(
    row: number,
    column: number,
    width: number,
    height: number,
    layer: number,
  ): boolean {
    if (
      row < 0 ||
      column < 0 ||
      row + height > gridHeight ||
      column + width > gridWidth
    ) {
      return false;
    }

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

  public getTerrainAt(
    row: number,
    column: number,
    layer: number,
  ): TerrainObject | null {
    return (
      this.terrainObjects.find(
        (terrain) =>
          terrain.layer === layer &&
          row >= terrain.row &&
          row < terrain.row + terrain.height &&
          column >= terrain.column &&
          column < terrain.column + terrain.width,
      ) ?? null
    );
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

  public eraseAt(
    row: number,
    column: number,
    layer: number,
  ): TerrainObject | null {
    const terrain = this.getTerrainAt(row, column, layer);

    if (!terrain) {
      return null;
    }

    return this.removeTerrain(terrain.id);
  }

  public clear(): void {
    for (const image of this.images.values()) {
      image.destroy();
    }

    this.images.clear();
    this.terrainObjects = [];
  }

  public restore(
    snapshot: TerrainObject[],
    getVariant: (variantId: string) => TerrainVariant | undefined,
  ): void {
    this.clear();

    for (const terrain of snapshot) {
      const variant = getVariant(terrain.variantId);

      if (!variant) {
        continue;
      }

      const restored: TerrainObject = {
        ...terrain,
      };

      this.terrainObjects.push(restored);
      this.renderTerrain(restored, variant);
    }
  }

  public updateAllTerrainPositions(
    getVariant: (variantId: string) => TerrainVariant | undefined,
  ): void {
    for (const terrain of this.terrainObjects) {
      const image = this.images.get(terrain.id);
      const variant = getVariant(terrain.variantId);

      if (!image || !variant) {
        continue;
      }

      const { offsetX, offsetY, scale } = this.getLayerOffset(terrain.layer);

      const x =
        offsetX +
        terrain.column * cellSize * scale +
        (terrain.width * cellSize * scale) / 2;

      const y =
        offsetY +
        terrain.row * cellSize * scale +
        (terrain.height * cellSize * scale) / 2;

      image.setPosition(x, y);

      image.setDisplaySize(
        terrain.width * cellSize * scale,
        terrain.height * cellSize * scale,
      );
    }
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

    image.setDepth(10 + terrain.layer);

    this.images.set(terrain.id, image);
  }
}
