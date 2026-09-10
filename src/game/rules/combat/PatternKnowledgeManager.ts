import {
  createPatternKnowledge,
  observeAttack,
  type PatternKnowledge,
} from "./PatternKnowledge";

export function getPatternKnowledge(
  patternKnowledge: Record<string, PatternKnowledge[]>,
  defenderId: string,
  attackerId: string,
): PatternKnowledge {
  const defenderKnowledge = patternKnowledge[defenderId] ?? [];

  const existing = defenderKnowledge.find(
    (knowledge) => knowledge.targetId === attackerId,
  );

  return existing ?? createPatternKnowledge(attackerId);
}

export function recordObservedAttack(
  patternKnowledge: Record<string, PatternKnowledge[]>,
  defenderId: string,
  attackerId: string,
  defenderIntelligence: number,
): Record<string, PatternKnowledge[]> {
  const defenderKnowledge = patternKnowledge[defenderId] ?? [];

  const existing = defenderKnowledge.find(
    (knowledge) => knowledge.targetId === attackerId,
  );

  const updatedKnowledge = existing
    ? observeAttack(existing, defenderIntelligence)
    : observeAttack(createPatternKnowledge(attackerId), defenderIntelligence);

  const updatedDefenderKnowledge = existing
    ? defenderKnowledge.map((knowledge) =>
        knowledge.targetId === attackerId ? updatedKnowledge : knowledge,
      )
    : [...defenderKnowledge, updatedKnowledge];

  return {
    ...patternKnowledge,
    [defenderId]: updatedDefenderKnowledge,
  };
}
