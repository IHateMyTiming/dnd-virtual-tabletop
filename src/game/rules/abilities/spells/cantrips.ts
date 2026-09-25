import type { AbilityDefinition } from "../Ability";

export const CANTRIPS: AbilityDefinition[] = [
  //COMBAT DEALING DAMAGE SPELLS
  {
    id: "iguinis",

    nameKey: "spell_iguinis",
    descriptionKey: "spell_iguinis_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 70,

    allowedClasses: ["cleric", "wizard", "bard", "druid"],

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 10,
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

    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "acid_throw",

    nameKey: "spell_acid_throw",
    descriptionKey: "spell_acid_throw_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 5,
    allowedClasses: ["cleric", "wizard", "bard"],

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 8,
          type: "magic",
          scaling: {
            type: "character-level",
            modifier: {
              9: +3,
              12: +4,
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

    nameKey: "spell_frosting_legs",
    descriptionKey: "spell_frosting_legs_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 12,
    allowedClasses: ["cleric", "wizard", "ranger"],

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
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
      {
        type: "apply-condition",
        conditionId: "freezed",
        duration: 3,
        stacks: 1,
        value: 0,
      },
    ],

    recovery: "cooldown",
    cooldown: 3,

    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "multi_missiles",

    nameKey: "spell_multi_missiles",
    descriptionKey: "spell_multi_missiles_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "area",
    attackType: "spell",

    range: 5,
    allowedClasses: ["wizard"],

    area: {
      shape: "circle",
      radius: 3,
    },

    effects: [
      {
        type: "damage",

        damage: {
          count: 1,
          sides: 5,
          type: "magic",
          scaling: {
            type: "character-level",
            modifier: {
              10: +2,
            },
          },
        },

        areaDamage: {
          falloff: 0.25,
        },
      },
    ],

    recovery: "cooldown",
    cooldown: 1,
    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "poison_gas",

    nameKey: "spell_poison_gas",
    descriptionKey: "spell_poison_gas_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 5,
    allowedClasses: ["cleric", "wizard", "bard"],

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 8,
          type: "magic",
          scaling: {
            type: "character-level",
            modifier: {
              9: +2,
            },
          },
        },
      },
      {
        type: "apply-condition",
        conditionId: "poisoned",
        duration: 3,
        stacks: 2,
        value: 1,
      },
    ],

    recovery: "unlimited",

    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "blessing_from_the_dead",

    nameKey: "spell_blessing_from_the_dead",
    descriptionKey: "spell_blessing_from_the_dead_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 8,
    allowedClasses: ["cleric", "wizard", "paladin"],
    classModifiers: {
      paladin: {
        range: 3,
      },
    },

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 6,
          type: "magic",
          scaling: {
            type: "character-level",
            modifier: {
              9: +2,
            },
          },
        },
      },
      {
        type: "apply-condition",
        conditionId: "cursed",
        duration: 3,
        stacks: 1,
        value: 25,
      },
    ],

    recovery: "cooldown",
    cooldown: 2,

    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "get_over_here",

    nameKey: "spell_get_over_here",
    descriptionKey: "spell_get_over_here_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 15,
    allowedClasses: ["wizard", "druid", "fighter", "barbarian", "paladin"],
    classModifiers: {
      fighter: {
        range: 5,
      },

      barbarian: {
        range: 5,
      },

      paladin: {
        range: 5,
      },
    },

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 7,
          type: "magic",
          scaling: {
            type: "character-level",
            modifier: {
              9: +2,
            },
          },
        },
        classDamageScaling: {
          fighter: {
            sides: 3,
          },

          barbarian: {
            sides: 3,
          },

          paladin: {
            sides: 3,
          },
        },
      },

      {
        type: "apply-condition",
        conditionId: "pulled",
        duration: 1,
        stacks: 1,
        value: 10,

        classConditionScaling: {
          fighter: {
            value: 4,
          },

          barbarian: {
            value: 4,
          },

          paladin: {
            value: 4,
          },
        },
      },
    ],

    recovery: "cooldown",
    cooldown: 4,

    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "shadow_bolt",

    nameKey: "spell_shadow_bolt",
    descriptionKey: "spell_shadow_bolt_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 7,

    allowedClasses: ["wizard"],

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 10,
          type: "magic",

          scaling: {
            type: "character-level",
            modifier: {
              9: +2,
            },
          },

          conditions: [
            {
              type: "target-has-condition",
              multiplier: 1.25,
            },
          ],
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  //SUPPORT SPELLS

  {
    id: "on_the_dot",

    nameKey: "spell_on_the_dot",
    descriptionKey: "spell_on_the_dot_description",

    actionType: "bonus-action",
    targetType: "self-or-ally",
    targetingMode: "single",

    range: 30,

    allowedClasses: ["wizard", "bard", "cleric"],

    effects: [
      {
        type: "modify-behavior",
        modifier: {
          behavior: "accuracy",
          operation: "multiply",
          trigger: "attack",
          value: 1.25,
          amount: 1,
        },
      },
    ],

    recovery: "unlimited",
    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "tank_that",

    nameKey: "spell_tank_that",
    descriptionKey: "spell_tank_that_description",

    actionType: "action",
    targetType: "self-or-ally",
    targetingMode: "single",

    range: 30,
    concentration: true,

    allowedClasses: ["wizard", "bard", "cleric", "paladin"],

    effects: [
      {
        type: "modify-behavior",
        modifier: {
          behavior: "magic-resistance",
          operation: "add",
          trigger: "turn",
          value: 1,
          amount: 1,
        },
        duration: 3,
      },
      {
        type: "modify-behavior",
        modifier: {
          behavior: "armor",
          operation: "add",
          trigger: "turn",
          value: 1,
          amount: 1,
        },
        duration: 3,
      },
    ],

    recovery: "unlimited",
    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "helping_hand",

    nameKey: "spell_helping_hand",
    descriptionKey: "spell_helping_hand_description",

    actionType: "action",
    targetType: "self-or-ally",
    targetingMode: "single",

    range: 30,

    allowedClasses: ["wizard", "bard", "cleric"],

    effects: [
      {
        type: "modify-behavior",
        modifier: {
          behavior: "attack-roll",
          operation: "add-dice",
          trigger: "roll",
          amount: 1,
          diceCount: 1,
          diceSides: 4,
        },
      },
    ],

    recovery: "unlimited",
    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  //NEEDS FIX
  //ILLUMINATION SYSTEM
  {
    id: "dancing_lights",

    nameKey: "spell_dancing_lights",
    descriptionKey: "spell_dancing_lights_description",

    actionType: "action",
    targetType: "self",
    targetingMode: "area",

    range: 15,

    area: {
      shape: "circle",
      radius: 4,
    },

    effects: [
      {
        type: "modify-behavior",
        // Im adding it later
      },
    ],

    recovery: "unlimited",
    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  //NEEDS FIX
  //INVISIBILTY SYSTEM
  {
    id: "i_was_here",

    nameKey: "spell_i_was_here",
    descriptionKey: "spell_i_was_here_description",

    actionType: "action",
    targetType: "self",
    targetingMode: "area",

    range: 7,

    area: {
      shape: "circle",
      radius: 2,
    },

    effects: [
      {
        type: "modify-behavior",
        // im adding this later
      },
    ],

    recovery: "unlimited",
    isSpell: true,

    imagePath: "/assets/abilities/",
  },
];
