import type { AbilityDefinition } from "../Ability";

export const LEVELFOURSPELLS: AbilityDefinition[] = [
  //COMBAT DEALING DAMAGE SPELLS

  {
    id: "haven",
    nameKey: "spell_haven",
    descriptionKey: "spell_haven_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 10,

    allowedClasses: ["cleric", "paladin"],

    classModifiers: {
      cleric: {
        range: 10,
      },
      paladin: {
        range: 0,
      },
    },

    area: {
      shape: "rectangle",
      width: 5,
      height: 5,
    },

    effects: [],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 4,

    resourceCost: {
      amount: 4,
    },

    instance: {
      lifetime: "duration",
      duration: 5,

      blocksDamage: true,

      effects: [
        {
          trigger: "turn-end",
          effect: {
            type: "heal",
            healing: {
              count: 1,
              sides: 20,
            },

            levelScaling: {
              12: {
                sides: 20,
              },
            },
          },
        },
      ],
    },

    imagePath: "/assets/abilities/",
  },
];
