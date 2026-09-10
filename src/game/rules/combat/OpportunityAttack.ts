import type { Combatant } from "./Combatant";
import { didLeaveMeleeRange } from "./Engagement";

export function getOpportunityAttackers(
  movingCombatant: Combatant,
  previousPosition: { x: number; y: number },
  newPosition: { x: number; y: number },
  combatants: Combatant[],
): Combatant[] {
  return combatants.filter((combatant) => {
    if (!combatant.alive) {
      return false;
    }

    if (combatant.id === movingCombatant.id) {
      return false;
    }

    if (combatant.team === movingCombatant.team) {
      return false;
    }

    if (!combatant.reactionAvailable) {
      return false;
    }

    return didLeaveMeleeRange(
      previousPosition,
      newPosition,
      combatant.position,
    );
  });
}
