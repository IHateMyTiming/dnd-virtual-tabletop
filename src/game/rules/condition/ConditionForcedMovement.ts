import type { ConditionState } from "./ConditionState";

export interface Position {
  x: number;
  y: number;
}

export function calculateForcedMovement(
  targetPosition: Position,
  sourcePosition: Position,
  condition: ConditionState,
): Position {
  const requestedDistance = condition.value ?? 0;

  if (requestedDistance <= 0) {
    return { ...targetPosition };
  }

  const dx = targetPosition.x - sourcePosition.x;
  const dy = targetPosition.y - sourcePosition.y;

  const currentDistance = Math.sqrt(dx * dx + dy * dy);

  if (currentDistance === 0) {
    return { ...targetPosition };
  }

  const minimumDistance = 1;

  const movementDistance =
    condition.id === "pulled"
      ? Math.min(
          requestedDistance,
          Math.max(0, currentDistance - minimumDistance),
        )
      : requestedDistance;

  const directionX = dx / currentDistance;
  const directionY = dy / currentDistance;

  const direction = condition.id === "pulled" ? -1 : 1;

  const newX = targetPosition.x + directionX * movementDistance * direction;

  const newY = targetPosition.y + directionY * movementDistance * direction;

  // Snap the final position to the 1m grid.
  return {
    x: Math.round(newX),
    y: Math.round(newY),
  };
}
