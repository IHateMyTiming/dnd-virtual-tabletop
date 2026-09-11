import { rollPercentage } from "../dice/Dice";
import type { ConditionState } from "../condition/ConditionState";
import { getConditionDefinition } from "../condition/Condition";

export type AdvantageState = "normal" | "advantage" | "disadvantage";

export type AttackOutcome = "miss" | "hit" | "critical";

export interface AdvantageRollResult {
  rolls: number[];
  outcomes: AttackOutcome[];
  selectedRoll: number;
  selectedOutcome: AttackOutcome;
}

export function classifyAttackRoll(
  roll: number,
  precision: number,
  critThreshold: number,
): AttackOutcome {
  if (roll <= critThreshold) {
    return "critical";
  }

  if (roll <= precision) {
    return "hit";
  }

  return "miss";
}

export function resolveAdvantage(
  state: AdvantageState,
  precision: number,
  critThreshold: number,
  roll: () => number = rollPercentage,
): AdvantageRollResult {
  const rolls = state === "normal" ? [roll()] : [roll(), roll()];

  const outcomes = rolls.map((value) =>
    classifyAttackRoll(value, precision, critThreshold),
  );

  const outcomeRank: Record<AttackOutcome, number> = {
    miss: 0,
    hit: 1,
    critical: 2,
  };

  let selectedIndex = 0;

  if (state === "advantage") {
    if (outcomeRank[outcomes[1]] > outcomeRank[outcomes[0]]) {
      selectedIndex = 1;
    }
  } else if (state === "disadvantage") {
    if (outcomeRank[outcomes[1]] < outcomeRank[outcomes[0]]) {
      selectedIndex = 1;
    }
  }

  return {
    rolls,
    outcomes,
    selectedRoll: rolls[selectedIndex],
    selectedOutcome: outcomes[selectedIndex],
  };
}

export function getAttackAdvantageState(
  attackerConditions: ConditionState[],
  defenderConditions: ConditionState[],
): AdvantageState {
  const attackerHasDisadvantage = attackerConditions.some((condition) => {
    const definition = getConditionDefinition(condition.id);

    return definition?.disadvantageOnAttacks === true;
  });

  const defenderGrantsAdvantage = defenderConditions.some((condition) => {
    const definition = getConditionDefinition(condition.id);

    return definition?.advantageWhenTargeted === true;
  });

  if (attackerHasDisadvantage && defenderGrantsAdvantage) {
    return "normal";
  }

  if (attackerHasDisadvantage) {
    return "disadvantage";
  }

  if (defenderGrantsAdvantage) {
    return "advantage";
  }

  return "normal";
}
