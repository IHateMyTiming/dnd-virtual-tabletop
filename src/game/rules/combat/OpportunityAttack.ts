import type { Combatant } from "./Combatant";
import { didLeaveMeleeRange } from "./Engagement";
import { calculateDistance } from "./Movement";

export function getOpportunityAttackers(
  movingCombatant: Combatant,
  previousPosition: { x: number; y: number },
  newPosition: { x: number; y: number },
  combatants: Combatant[],
): Combatant[] {
  return combatants.filter((combatant) => {
    if (!combatant.alive) return false;
    if (combatant.id === movingCombatant.id) return false;
    if (combatant.team === movingCombatant.team) return false;

    const previousDistance = calculateDistance(
      previousPosition,
      combatant.position,
    );

    const newDistance = calculateDistance(newPosition, combatant.position);

    console.log("AOO CHECK", {
      moving: movingCombatant.id,
      enemy: combatant.id,
      previousPosition,
      newPosition,
      enemyPosition: combatant.position,
      previousDistance,
      newDistance,
      wasInRange: previousDistance <= 1,
      isInRange: newDistance <= 1,
    });

    return didLeaveMeleeRange(
      previousPosition,
      newPosition,
      combatant.position,
    );
  });
}
