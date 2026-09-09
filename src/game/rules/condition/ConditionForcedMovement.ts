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
  const distance = condition.value ?? 0;

  if (distance <= 0) {
    return { ...targetPosition };
  }

  const dx = targetPosition.x - sourcePosition.x;
  const dy = targetPosition.y - sourcePosition.y;
  const currentDistance = Math.sqrt(dx * dx + dy * dy);

  if (currentDistance === 0) {
    return { ...targetPosition };
  }

  const directionX = dx / currentDistance;
  const directionY = dy / currentDistance;

  const direction = condition.id === "pulled" ? -1 : 1;

  return {
    x: targetPosition.x + directionX * distance * direction,
    y: targetPosition.y + directionY * distance * direction,
  };
}
