export type MapObjectType =
  | "boulder"
  | "tree"
  | "table"
  | "chair"
  | "chest"
  | "pillar"
  | "statue"
  | "door"
  | "stairs";

export interface MapObject {
  id: string;
  type: MapObjectType;
  row: number;
  column: number;
  layer: number;

  // Visual representation
  imageKey?: string;

  // Whether characters will eventually be unable to walk through it
  blocksMovement: boolean;
}
