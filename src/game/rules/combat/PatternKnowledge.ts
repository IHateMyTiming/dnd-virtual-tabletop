export interface PatternKnowledge {
  targetId: string;
  attacksObserved: number;
  bonus: number;
}

export function createPatternKnowledge(targetId: string): PatternKnowledge {
  return {
    targetId,
    attacksObserved: 0,
    bonus: 0,
  };
}

export function observeAttack(
  knowledge: PatternKnowledge,
  intelligenceModifier: number,
): PatternKnowledge {
  const attacksObserved = knowledge.attacksObserved + 1;

  const bonus = Math.max(0, intelligenceModifier * 5) * attacksObserved;

  return {
    ...knowledge,
    attacksObserved,
    bonus,
  };
}
