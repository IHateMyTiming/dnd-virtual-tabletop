export type CombatActionType = "action" | "bonus-action" | "reaction";

export function isActionAvailable(
  type: CombatActionType,
  actionAvailable: boolean,
  bonusActionAvailable: boolean,
  reactionAvailable: boolean,
): boolean {
  switch (type) {
    case "action":
      return actionAvailable;

    case "bonus-action":
      return bonusActionAvailable;

    case "reaction":
      return reactionAvailable;
  }
}
