export type MovementType = "walk" | "jump" | "climb" | "swim";

export interface Position {
  x: number;
  y: number;
}

export const MOVEMENT_COST_MULTIPLIER: Record<MovementType, number> = {
  walk: 1,
  jump: 2,
  climb: 2,
  swim: 2,
};

export function calculateDistance(from: Position, to: Position): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateMovementCost(
  distance: number,
  type: MovementType,
): number {
  if (distance < 0) {
    throw new Error("Movement distance cannot be negative.");
  }

  return distance * MOVEMENT_COST_MULTIPLIER[type];
}

export interface Position {
  x: number;
  y: number;
}
