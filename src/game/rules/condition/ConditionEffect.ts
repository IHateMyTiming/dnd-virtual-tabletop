export type ConditionEffectType =
  | "incapacitate"
  | "damage-over-time"
  | "movement-modifier"
  | "movement-restriction"
  | "special-movement-restriction"
  | "bonus-action-restriction"
  | "attack-accuracy-modifier"
  | "dodge-modifier"
  | "attack-target-restriction"
  | "movement-direction-restriction"
  | "damage-modifier"
  | "incoming-damage-modifier"
  | "healing-restriction"
  | "spell-restriction";

export interface ConditionEffect {
  type: ConditionEffectType;

  /**
   * Optional numeric value used by effects such as
   * movement reduction, accuracy modification,
   * damage modification, etc.
   */
  value?: number;

  /**
   * Optional identifier used when the effect is
   * specific to another character.
   *
   * Example:
   * Charmed by "wizard"
   * Frightened by "dragon"
   */
  sourceId?: string;
}
