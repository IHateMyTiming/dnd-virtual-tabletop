import type { CombatState } from "./CombatState";
import type { Combatant } from "./Combatant";

export function startTurn(state: CombatState): CombatState {
  const currentIndex = state.currentTurnIndex;

  return {
    ...state,
    combatants: state.combatants.map((combatant, index) =>
      index === currentIndex
        ? {
            ...combatant,

            actionAvailable: true,
            bonusActionAvailable: true,
            reactionAvailable: true,

            movementRemaining: combatant.movement,
          }
        : combatant,
    ),
  };
}

export function endTurn(state: CombatState): CombatState {
  const nextIndex = state.currentTurnIndex + 1;

  if (nextIndex >= state.combatants.length) {
    return {
      ...state,
      round: state.round + 1,
      currentTurnIndex: 0,
    };
  }

  return {
    ...state,
    currentTurnIndex: nextIndex,
  };
}

export function getCurrentCombatant(state: CombatState): Combatant | undefined {
  return state.combatants[state.currentTurnIndex];
}
