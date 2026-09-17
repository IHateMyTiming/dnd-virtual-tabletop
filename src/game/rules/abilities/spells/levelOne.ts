import type { AbilityDefinition } from "../Ability";

export const LEVELONESPELLS: AbilityDefinition[] = [
  //COMBAT DEALING DAMAGE SPELLS WIZARD

  {
    id: "burning_ray",

    nameKey: "spell_burning_ray",
    descriptionKey: "spell_burning_ray_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "area",
    attackType: "spell",

    range: 12,

    area: {
      shape: "circle",
      radius: 3,
    },

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 7,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              5: 3,
              9: 4,
            },
          },
        },
      },
      {
        type: "apply-condition",
        conditionId: "burning",
        duration: 2,
        stacks: 1,
        value: 3,
      },
    ],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "ice_shard",

    nameKey: "spell_ice_shard",
    descriptionKey: "spell_ice_shard_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 10,

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 7,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              5: 3,
              9: 4,
            },
            modifier: {
              12: +1,
            },
          },
        },
      },
      {
        type: "apply-condition",
        conditionId: "pushed",
        duration: 1,
        stacks: 1,
        value: 4,
      },
      {
        type: "apply-condition",
        conditionId: "slowed",
        duration: 2,
        stacks: 1,
        value: 3,
      },
    ],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "hand_pistol_gun",

    nameKey: "spell_hand_pistol_gun",
    descriptionKey: "spell_hand_pistol_gun_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "multi",

    attackType: "spell",

    range: 15,
    maxTargets: 3,

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 8,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              9: 2,
            },
          },
        },
      },
    ],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "lightning_arc",

    nameKey: "spell_lightning_arc",
    descriptionKey: "spell_lightning_arc_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "chain",

    attackType: "spell",

    range: 10,
    maxTargets: 4,
    chainRange: 3,

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 6,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              9: 3,
            },
          },
        },
      },
    ],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "blood_thirster",

    nameKey: "spell_blood_thirster",
    descriptionKey: "spell_blood_thirster_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 10,

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 10,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              6: 3,
            },
          },
        },
      },

      {
        type: "modify-behavior",
        modifier: {
          behavior: "damage",
          operation: "multiply",
          trigger: "attack",
          value: 1.25,
          amount: 1,

          threshold: {
            type: "health-percent",
            operator: "less-than",
            value: 50,
            target: "target",
          },
        },
      },
    ],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,

    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "earth_spike",

    nameKey: "spell_earth_spike",
    descriptionKey: "spell_earth_spike_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 7,

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 9,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              9: 3,
            },
            modifier: {
              11: +3,
            },
          },
        },
      },
      {
        type: "apply-condition",
        conditionId: "armor-penetration",
        duration: 2,
        stacks: 1,
        value: 0,
      },
    ],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //COMBAT DEALING DAMAGE SPELLS  CLERIC

  {
    id: "radiant_bolt",

    nameKey: "spell_radiant_bolt",
    descriptionKey: "spell_radiant_bolt_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 15,

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 6,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              6: 3,
            },
            modifier: {
              12: +3,
            },
          },
        },
      },

      {
        type: "modify-behavior",
        modifier: {
          behavior: "damage",
          operation: "multiply",
          trigger: "spell",
          value: 1.5,
          amount: 1,
          targetCreatureType: "undead",
        },
      },
    ],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //UTILITY SPELLS WIZARD

  {
    id: "contact_spirits",

    nameKey: "spell_contact_spirits",
    descriptionKey: "spell_contact_spirits_description",

    actionType: "action",
    targetType: "self",
    targetingMode: "single",

    range: 0,

    effects: [],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "detect_magic",

    nameKey: "spell_detect_magic",
    descriptionKey: "spell_detect_magic_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "area",

    range: 15,

    area: {
      shape: "circle",
      radius: 15,
    },

    effects: [],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "telepathy",

    nameKey: "spell_telepathy",
    descriptionKey: "spell_telepathy_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",

    range: 7,

    effects: [],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "charm_person",

    nameKey: "spell_charm_person",
    descriptionKey: "spell_charm_person_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",

    range: 1,

    effects: [
      {
        type: "apply-condition",
        conditionId: "charmed",
        duration: 3,
        stacks: 1,
        value: 0,
      },
    ],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //NEEDS FIX
  //NEEDS INVIBILITY TO WORK AS PLANNED
  //TREAT IT AS A SUMMON WITH HP, DESTROY IT CLEARS THE FOG OF VISION OTHERWISE YOU CAN DISARM IT BY ROLLING
  {
    id: "pink",

    nameKey: "spell_pink",
    descriptionKey: "spell_pink_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 15,

    area: {
      shape: "circle",
      radius: 3,
    },

    effects: [],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    instance: {
      hp: 10,
      maxHp: 10,
    },

    imagePath: "/assets/abilities/",
  },

  //UTILITY SPELLS CLERIC
  {
    id: "bless",

    nameKey: "spell_bless",
    descriptionKey: "spell_bless_description",

    actionType: "action",
    targetType: "ally",
    targetingMode: "single",

    range: 15,

    effects: [
      {
        type: "modify-behavior",
        modifier: {
          behavior: "attack-roll",
          operation: "add-dice",
          trigger: "roll",
          amount: 1,
          diceCount: 1,
          diceSides: 6,
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "cure_light_wounds",

    nameKey: "spell_cure_light_wounds",
    descriptionKey: "spell_cure_light_wounds_description",

    actionType: "action",
    targetType: "ally",
    targetingMode: "single",

    range: 1,

    effects: [
      {
        type: "heal",
        healing: {
          count: 1,
          sides: 8,
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "divine_cure",

    nameKey: "spell_divine_cure",
    descriptionKey: "spell_divine_cure_description",

    actionType: "action",
    targetType: "ally",
    targetingMode: "single",

    range: 8,

    effects: [
      {
        type: "heal",
        healing: {
          count: 1,
          sides: 4,
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "intimidation",

    nameKey: "spell_intimidation",
    descriptionKey: "spell_intimidation_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",

    range: 10,

    effects: [
      {
        type: "apply-condition",
        conditionId: "frightened",
        duration: 3,
        stacks: 1,
        value: 0,
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "magic_weapon",

    nameKey: "spell_magic_weapon",
    descriptionKey: "spell_magic_weapon_description",

    actionType: "action",
    targetType: "ally",
    targetingMode: "single",

    range: 10,

    effects: [
      {
        type: "modify-behavior",
        duration: 3,
        modifier: {
          behavior: "damage",
          operation: "add-dice",
          trigger: "attack",
          diceCount: 1,
          diceSides: 6,
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //NEEDS FIX
  //PLACE
  {
    id: "sanctuary",

    nameKey: "spell_sanctuary",
    descriptionKey: "spell_sanctuary_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "area",
    attackType: "spell",

    range: 15,

    area: {
      shape: "circle",
      radius: 3,
    },

    effects: [
      // Creatures inside the Sanctuary cannot be damaged.
      // Creatures inside the Sanctuary cannot attack.
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //NEEDS FIX
  //CREATURE ID
  {
    id: "speak_with_dead",

    nameKey: "spell_speak_with_dead",
    descriptionKey: "spell_speak_with_dead_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",

    range: 1,

    effects: [
      // The target must be a corpse.
      // The corpse answers up to three questions.
      // The Master determines the answers based on the corpse's knowledge.
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "test",

    nameKey: "spell_test",
    descriptionKey: "spell_test_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 100,

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 1,
          type: "magic",
        },
      },
    ],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },
];
