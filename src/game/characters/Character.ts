export type CharacterDirection = "front" | "back" | "left" | "right";

export interface CharacterCustomization {
  headId: string;
  hairId: string;
  skinId: string;
  hairColor: string;
  bodyId: string;
  capeId?: string;
}

export interface Character {
  id: string;
  name: string;

  row: number;
  column: number;

  width: number;
  height: number;

  layer: number;

  direction: CharacterDirection;

  customization: CharacterCustomization;
}
