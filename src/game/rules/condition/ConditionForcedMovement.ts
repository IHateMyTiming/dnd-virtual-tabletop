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

  const movementDistance =
    condition.id === "pulled"
      ? Math.min(requestedDistance, currentDistance)
      : requestedDistance;

  const directionX = dx / currentDistance;
  const directionY = dy / currentDistance;

  const direction = condition.id === "pulled" ? -1 : 1;

  return {
    x: targetPosition.x + directionX * movementDistance * direction,
    y: targetPosition.y + directionY * movementDistance * direction,
  };
}
