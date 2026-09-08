import type { Combatant } from "./Combatant";
import { ConditionManager } from "../condition/ConditionManager";

export interface CombatState {
  combatants: Combatant[];

  round: number;
  currentTurnIndex: number;
}

export function createCombatState(combatants: Combatant[]): CombatState {
  const orderedCombatants = sortCombatantsByInitiative(combatants);

  return {
    combatants: orderedCombatants,
    round: 1,
    currentTurnIndex: 0,
    conditionManager: new ConditionManager(),
  };
}

export function getCurrentCombatant(state: CombatState): Combatant | undefined {
  return state.combatants[state.currentTurnIndex];
}

function sortCombatantsByInitiative(combatants: Combatant[]): Combatant[] {
  return [...combatants].sort((a, b) => {
    const dexDifference = b.stats.dexterity - a.stats.dexterity;

    if (dexDifference !== 0) {
      return dexDifference;
    }

    const initiativeDifference = b.initiative - a.initiative;

    if (initiativeDifference !== 0) {
      return initiativeDifference;
    }

    return Math.random() - 0.5;
  });
}

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
          }
        : combatant,
    ),
  };
}

export interface CombatState {
  combatants: Combatant[];
  round: number;
  currentTurnIndex: number;
  conditionManager: ConditionManager;
}
