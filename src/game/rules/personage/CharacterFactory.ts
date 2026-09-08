import type { RulesCharacter } from "./RulesCharacter";
import type { CharacterStats } from "../stats/Stats";
import { getAbilityModifier } from "../stats/Stats";
import { DEFAULT_STARTING_STATS } from "../stats/StartingStats";
import { CHARACTER_CLASSES } from "../classes/Classes";
import type { CharacterClassId } from "../classes/Class";

export function createRulesCharacter(
  id: string,
  name: string,
  classId: CharacterClassId,
  stats: CharacterStats = DEFAULT_STARTING_STATS,
): RulesCharacter {
  const characterClass = CHARACTER_CLASSES.find(
    (characterClass) => characterClass.id === classId,
  );

  if (!characterClass) {
    throw new Error(`Unknown character class: ${classId}`);
  }

  const maxHp = characterClass.baseHp + getAbilityModifier(stats.constitution);

  return {
    id,
    name,
    classId,
    level: 1,
    xp: 0,
    stats: { ...stats },
    hp: maxHp,
    maxHp,
  };
}
