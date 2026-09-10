import type { Position } from "./Movement";
import { calculateDistance } from "./Movement";

export const DEFAULT_MELEE_RANGE = 1;

export function isInMeleeRange(
  sourcePosition: Position,
  targetPosition: Position,
  meleeRange = DEFAULT_MELEE_RANGE,
): boolean {
  return calculateDistance(sourcePosition, targetPosition) <= meleeRange;
}

export function didLeaveMeleeRange(
  previousPosition: Position,
  newPosition: Position,
  enemyPosition: Position,
  meleeRange = DEFAULT_MELEE_RANGE,
): boolean {
  const wasInRange = isInMeleeRange(
    previousPosition,
    enemyPosition,
    meleeRange,
  );

  const isInRange = isInMeleeRange(newPosition, enemyPosition, meleeRange);

  return wasInRange && !isInRange;
}
