import type { AbilityDefinition } from "../Ability";

export const LEVELTWOSPELLS: AbilityDefinition[] = [
  //COMBAT DEALING DAMAGE SPELLS

  {
    id: "acid_arrow",

    nameKey: "spell_acid_arrow",
    descriptionKey: "spell_acid_arrow_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 8,

    area: {
      shape: "circle",
      radius: 2,
    },

    effects: [
      {
        type: "damage",
        damage: {
          count: 3,
          sides: 7,
          type: "magic",
          scaling: {
            type: "character-level",
            modifier: {
              9: +2,
            },
          },
        },
      },
    ],

    recovery: "unlimited",

    instance: {
      lifetime: "duration",
      duration: 2,

      effects: [
        {
          trigger: "enter-area",
          effect: {
            type: "damage",
            damage: {
              count: 2,
              sides: 4,
              type: "magic",
            },
          },
        },
        {
          trigger: "turn-start",
          effect: {
            type: "damage",
            damage: {
              count: 2,
              sides: 4,
              type: "magic",
            },
          },
        },
      ],
    },

    isSpell: true,
    spellLevel: 2,

    allowedClasses: ["wizard"],

    concentration: true,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //UTILITY SPELLS

  {
    id: "blur",

    nameKey: "spell_blur",
    descriptionKey: "spell_blur_description",

    actionType: "action",
    targetType: "self",
    targetingMode: "single",

    allowedClasses: ["wizard", "cleric", "thief", "bard"],

    concentration: true,

    effects: [
      {
        type: "modify-behavior",
        duration: 3,
        modifier: {
          behavior: "defense",
          operation: "disadvantage",
          trigger: "attack",
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    imagePath: "/assets/abilities/",
  },

  // NEEDS FIX
  // Arcane Lock requires the generic interactable/lock system.
  {
    id: "arcane_lock",

    nameKey: "spell_arcane_lock",
    descriptionKey: "spell_arcane_lock_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "single",

    range: 1,

    allowedClasses: ["wizard"],

    effects: [],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 2,

    imagePath: "/assets/abilities/",
  },
];
