import type { CharacterClass } from "./Class";

export const CHARACTER_CLASSES: CharacterClass[] = [
  {
    id: "barbarian",
    nameKey: "class_barbarian",
    descriptionKey: "class_barbarian_description",
    baseHp: 8,
    baseDamageDie: "d10",
  },

  {
    id: "bard",
    nameKey: "class_bard",
    descriptionKey: "class_bard_description",
    baseHp: 6,
    baseDamageDie: "d6",
  },

  {
    id: "cleric",
    nameKey: "class_cleric",
    descriptionKey: "class_cleric_description",
    baseHp: 8,
    baseDamageDie: "d6",
  },

  {
    id: "druid",
    nameKey: "class_druid",
    descriptionKey: "class_druid_description",
    baseHp: 6,
    baseDamageDie: "d6",
  },

  {
    id: "fighter",
    nameKey: "class_fighter",
    descriptionKey: "class_fighter_description",
    baseHp: 10,
    baseDamageDie: "d10",
  },

  {
    id: "ranger",
    nameKey: "class_ranger",
    descriptionKey: "class_ranger_description",
    baseHp: 8,
    baseDamageDie: "d8",
  },

  {
    id: "thief",
    nameKey: "class_thief",
    descriptionKey: "class_thief_description",
    baseHp: 6,
    baseDamageDie: "d8",
  },

  {
    id: "wizard",
    nameKey: "class_wizard",
    descriptionKey: "class_wizard_description",
    baseHp: 4,
    baseDamageDie: "d4",
  },

  {
    id: "paladin",
    nameKey: "class_paladin",
    descriptionKey: "class_paladin_description",
    baseHp: 10,
    baseDamageDie: "d10",
  },
];
