import type { MapObject } from "../scenes/MapObjects";
import type { Character } from "../characters/Character";
import type { TerrainObject } from "../scenes/TerrainManager";

export interface MapSaveData {
  version: number;

  gridWidth: number;
  gridHeight: number;

  currentLayer: number;
  layerCount: number;

  terrains: TerrainObject[];
  objects: MapObject[];
  characters: Character[];
}
