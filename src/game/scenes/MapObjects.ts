export type ObjectType = "boulder";

export interface MapObject {
  id: string;
  type: ObjectType;
  row: number;
  column: number;
  layer: number;
}
