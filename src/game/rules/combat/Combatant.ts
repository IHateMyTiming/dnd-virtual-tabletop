import type { CharacterStats } from "../stats/Stats";

export interface Combatant {
  id: string;
  name: string;
  initiative: number;

  stats: CharacterStats;

  hp: number;
  maxHp: number;

  armor: number;

  position: {
    x: number;
    y: number;
  };

  movement: number;
  movementRemaining: number;
  actionAvailable: boolean;
  bonusActionAvailable: boolean;
  reactionAvailable: boolean;

  alive: boolean;
}
