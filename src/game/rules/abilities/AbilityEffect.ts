export type AbilityEffectType =
  | "damage"
  | "heal"
  | "apply-condition"
  | "remove-condition"
  | "move"
  | "teleport"
  | "modify-stat";

export interface AbilityEffect {
  type: AbilityEffectType;

  value?: number;

  damage?: {
    count: number;
    sides: number;
    modifier?: number;
  };

  conditionId?: string;

  duration?: number;

  stacks?: number;

  distance?: number;
}
