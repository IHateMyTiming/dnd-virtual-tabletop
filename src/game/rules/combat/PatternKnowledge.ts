export interface PatternKnowledge {
  targetId: string;
  attacksObserved: number;
  stacks: number;
  bonus: number;
}

export function createPatternKnowledge(targetId: string): PatternKnowledge {
  return {
    targetId,
    attacksObserved: 0,
    stacks: 0,
    bonus: 0,
  };
}

export function observeAttack(
  knowledge: PatternKnowledge,
  intelligence: number,
): PatternKnowledge {
  const attacksObserved = knowledge.attacksObserved + 1;
  const maxBonus = getPatternKnowledgeMaxBonus(intelligence);

  const stacks =
    intelligence === 18
      ? Math.min(5, attacksObserved)
      : Math.min(5, Math.max(0, attacksObserved - 1));

  const bonus = (maxBonus / 5) * stacks;

  return {
    ...knowledge,
    attacksObserved,
    stacks,
    bonus,
  };
}

function getPatternKnowledgeMaxBonus(intelligence: number): number {
  if (intelligence <= 8) return 10;
  if (intelligence <= 12) return 15;
  if (intelligence <= 15) return 20;
  if (intelligence <= 17) return 25;
  return 40;
}
