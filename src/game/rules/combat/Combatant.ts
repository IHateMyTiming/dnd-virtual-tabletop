import type { CharacterStats } from "../stats/Stats";
import type { CombatModifier } from "./CombatModifier";
import type { CharacterClassId } from "../classes/Class";

export type CombatantTeam = "player" | "enemy";

export interface ConcentrationState {
  abilityId: string;
  instanceId?: string;
  remainingDuration?: number;
}
export interface Combatant {
  id: string;

  name: string;

  level: number;

  initiative: number;

  stats: CharacterStats;

  hp: number;
  temporaryHp: number;
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

  team: CombatantTeam;

  magicResistance: number;

  modifiers: CombatModifier[];

  creatureType: CreatureType;

  class: CharacterClassId;

  concentration?: ConcentrationState;
}

export type CreatureType =
  | "humanoid"
  | "undead"
  | "beast"
  | "construct"
  | "celestial"
  | "elemental"
  | "dragon"
  | "giant"
  | "monstrosity"
  | "dead";
