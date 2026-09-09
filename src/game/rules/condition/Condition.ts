export type ConditionId =
  | "stunned"
  | "poisoned"
  | "slowed"
  | "burning"
  | "blinded"
  | "charmed"
  | "cursed"
  | "frightened"
  | "petrified"
  | "sleeping"
  | "rooted"
  | "suppressed"
  | "silenced"
  | "freezed"
  | "acid"
  | "bleeding"
  | "marked"
  | "armor-penetration"
  | "magic-penetration"
  | "pulled"
  | "pushed";

export interface ConditionDefinition {
  id: ConditionId;
  nameKey: string;
  descriptionKey: string;
  maxStacks: number;
}

export const CONDITIONS: ConditionDefinition[] = [
  {
    id: "stunned",
    nameKey: "condition_stunned",
    descriptionKey: "condition_stunned_description",
    maxStacks: 1,
  },
  {
    id: "poisoned",
    nameKey: "condition_poisoned",
    descriptionKey: "condition_poisoned_description",
    maxStacks: 5,
  },
  {
    id: "slowed",
    nameKey: "condition_slowed",
    descriptionKey: "condition_slowed_description",
    maxStacks: 1,
  },
  {
    id: "burning",
    nameKey: "condition_burning",
    descriptionKey: "condition_burning_description",
    maxStacks: 5,
  },
  {
    id: "blinded",
    nameKey: "condition_blinded",
    descriptionKey: "condition_blinded_description",
    maxStacks: 1,
  },
  {
    id: "charmed",
    nameKey: "condition_charmed",
    descriptionKey: "condition_charmed_description",
    maxStacks: 1,
  },
  {
    id: "cursed",
    nameKey: "condition_cursed",
    descriptionKey: "condition_cursed_description",
    maxStacks: 1,
  },
  {
    id: "frightened",
    nameKey: "condition_frightened",
    descriptionKey: "condition_frightened_description",
    maxStacks: 1,
  },
  {
    id: "petrified",
    nameKey: "condition_petrified",
    descriptionKey: "condition_petrified_description",
    maxStacks: 1,
  },
  {
    id: "sleeping",
    nameKey: "condition_sleeping",
    descriptionKey: "condition_sleeping_description",
    maxStacks: 1,
  },
  {
    id: "rooted",
    nameKey: "condition_rooted",
    descriptionKey: "condition_rooted_description",
    maxStacks: 1,
  },
  {
    id: "suppressed",
    nameKey: "condition_suppressed",
    descriptionKey: "condition_suppressed_description",
    maxStacks: 1,
  },
  {
    id: "silenced",
    nameKey: "condition_silenced",
    descriptionKey: "condition_silenced_description",
    maxStacks: 1,
  },

  {
    id: "freezed",
    nameKey: "condition_freezed",
    descriptionKey: "condition_freezed_description",
    maxStacks: 1,
  },
  {
    id: "acid",
    nameKey: "condition_acid",
    descriptionKey: "condition_acid_description",
    maxStacks: 1,
  },
  {
    id: "bleeding",
    nameKey: "condition_bleeding",
    descriptionKey: "condition_bleeding_description",
    maxStacks: 5,
  },
  {
    id: "marked",
    nameKey: "condition_marked",
    descriptionKey: "condition_marked_description",
    maxStacks: 1,
  },
  {
    id: "armor-penetration",
    nameKey: "condition_armor_penetration",
    descriptionKey: "condition_armor_penetration_description",
    maxStacks: 1,
  },
  {
    id: "magic-penetration",
    nameKey: "condition_magic_penetration",
    descriptionKey: "condition_magic_penetration_description",
    maxStacks: 1,
  },
  {
    id: "pulled",
    nameKey: "condition_pulled",
    descriptionKey: "condition_pulled_description",
    maxStacks: 1,
  },
  {
    id: "pushed",
    nameKey: "condition_pushed",
    descriptionKey: "condition_pushed_description",
    maxStacks: 1,
  },
];

export function getConditionDefinition(
  id: ConditionId,
): ConditionDefinition | undefined {
  return CONDITIONS.find((condition) => condition.id === id);
}
