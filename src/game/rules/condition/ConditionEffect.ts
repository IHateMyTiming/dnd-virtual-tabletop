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
  | "spell-restriction"
  | "incoming-damage-modifier"
  | "armor-modifier"
  | "magic-resistance-modifier"
  | "forced-movement";

export interface ConditionEffect {
  type: ConditionEffectType;
  value?: number;
  sourceId?: string;
}
