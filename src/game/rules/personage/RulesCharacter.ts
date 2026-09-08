import type { CharacterStats } from "../stats/Stats";
import type { CharacterClassId } from "../classes/Class";

export interface RulesCharacter {
  id: string;
  name: string;

  classId: CharacterClassId;

  level: number;
  xp: number;

  stats: CharacterStats;

  hp: number;
  maxHp: number;
}
