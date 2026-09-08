import type { AbilityDefinition } from "./Ability";

export const ABILITIES: AbilityDefinition[] = [
  {
    id: "some_ability",
    nameKey: "ability_some_ability",
    descriptionKey: "ability_some_ability_description",
    actionType: "action",
    targetType: "enemy",
    range: 10,
    effects: [],
    recovery: "cooldown",
    cooldown: 8,
  },
];
