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
              12: 6,
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
              12: 6,
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
              12: 5,
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
    attackType: "spell",

    range: 20,
    maxTargets: 6,

    area: {
      shape: "circle",
      radius: 3,
    },

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
              12: 6,
            },
          },
        },

        areaDamage: {
          falloff: 0.5,
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

    nameKey: "poison_gas",
    descriptionKey: "spell_poison_gas_description",

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

    nameKey: "blessing_from_the_dead",
    descriptionKey: "spell_blessing_from_the_dead_description",

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
          sides: 7,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              1: 1,
              5: 2,
              10: 3,
            },
          },
        },
      },
      {
        type: "apply-condition",
        conditionId: "cursed",
        duration: 3,
        stacks: 1,
        value: 0,
      },
    ],

    recovery: "cooldown",
    cooldown: 2,

    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "get_over_here",

    nameKey: "get_over_here",
    descriptionKey: "spell_get_over_here_description",

    actionType: "action",
    targetType: "enemy",
    attackType: "spell",

    range: 30,
    maxTargets: 1,

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 10,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              1: 1,
              5: 2,
              10: 3,
            },
          },
        },
      },
      {
        type: "apply-condition",
        conditionId: "pulled",
        duration: 1,
        stacks: 1,
        value: 10,
      },
    ],

    recovery: "cooldown",
    cooldown: 2,

    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "shadow_bolt",

    nameKey: "shadow_bolt",
    descriptionKey: "spell_shadow_bolt_description",

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
              12: 6,
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

    nameKey: "on_the_dot",
    descriptionKey: "spell_on_the_dot_description",

    actionType: "bonus-action",
    targetType: "self-or-ally",

    range: 30,

    effects: [
      {
        type: "modify-behavior",
        modifier: {
          behavior: "accuracy",
          operation: "multiply",
          trigger: "attack",
          amount: 1.25,
        },
      },
    ],

    recovery: "unlimited",
    isSpell: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "tank_that",

    nameKey: "tank_that",
    descriptionKey: "spell_tank_that_description",

    actionType: "action",
    targetType: "self-or-ally",

    range: 30,

    effects: [
      {
        type: "modify-behavior",
        modifier: {
          behavior: "magic-resistance",
          operation: "add",
          trigger: "turn",
          amount: 5,
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

    nameKey: "helping_hand",
    descriptionKey: "spell_helping_hand_description",

    actionType: "action",
    targetType: "self-or-ally",

    range: 30,

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

  //ILLUMINATION SYSTEM
  {
    id: "dancing_lights",

    nameKey: "dancing_lights",
    descriptionKey: "spell_dancing_lights_description",

    actionType: "action",
    targetType: "area",

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

  {
    id: "i_was_here",

    nameKey: "i_was_here",
    descriptionKey: "spell_i_was_here_description",

    actionType: "action",
    targetType: "area",

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
