import type { AbilityDefinition } from "../Ability";

export const CANTRIPS: AbilityDefinition[] = [
  //COMBAT DEALING DAMAGE SPELLS
  {
    id: "iguinis",

    nameKey: "spell_iguinis",
    descriptionKey: "spell_iguinis_description",

    actionType: "action",
    targetType: "enemy",
    attackType: "spell",

    range: 15,
    maxTargets: 1,

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 4,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              1: 1,
              3: 2,
              5: 3,
              9: 4,
              11: 5,
              13: 6,
            },
          },
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "acid_throw",

    nameKey: "acid_throw",
    descriptionKey: "spell_acid_throw_description",

    actionType: "action",
    targetType: "enemy",
    attackType: "spell",

    range: 15,
    maxTargets: 1,

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 3,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              1: 1,
              3: 2,
              5: 3,
              9: 4,
              11: 5,
              13: 6,
            },
          },
        },
      },
      {
        type: "apply-condition",
        conditionId: "acid",
        duration: 2,
        stacks: 1,
        value: 2,
      },
    ],

    recovery: "unlimited",

    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "frosting_legs",

    nameKey: "frosting_legs",
    descriptionKey: "spell_frosting_legs_description",

    actionType: "action",
    targetType: "enemy",
    attackType: "spell",

    range: 25,
    maxTargets: 1,

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 5,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              1: 1,
              6: 3,
              10: 4,
              13: 5,
            },
          },
        },
      },
      {
        type: "apply-condition",
        conditionId: "freezed",
        duration: 3,
        stacks: 1,
        value: 0,
      },
    ],

    recovery: "unlimited",

    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  //Going to bed finish this spell later
  {
    id: "multi_missiles",

    nameKey: "spell_multi_missiles",
    descriptionKey: "spell_multi_missiles_description",

    actionType: "action",
    targetType: "enemy",
    attackType: "spell",

    range: 20,
    maxTargets: 1,

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 4,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              1: 1,
              3: 2,
              5: 3,
              9: 4,
              11: 5,
              13: 6,
            },
          },
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,

    imagePath: "/assets/abilities/",
  },
];
