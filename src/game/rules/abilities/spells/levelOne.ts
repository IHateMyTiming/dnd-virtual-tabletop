import type { AbilityDefinition } from "../Ability";

export const LEVELONESPELLS: AbilityDefinition[] = [
  //COMBAT DEALING DAMAGE SPELLS

  {
    id: "burning_ray",

    nameKey: "spell_burning_ray",
    descriptionKey: "spell_burning_ray_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "area",
    attackType: "spell",

    range: 12,
    allowedClasses: ["wizard"],

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

    allowedClasses: ["wizard", "ranger"],

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

        classDamageScaling: {
          ranger: {
            sides: 2,
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
        classConditionScaling: {
          ranger: {
            value: 1,
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
    id: "hand_pistol_gun",

    nameKey: "spell_hand_pistol_gun",
    descriptionKey: "spell_hand_pistol_gun_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "multi",

    attackType: "spell",

    range: 15,
    maxTargets: 3,
    allowedClasses: ["wizard"],

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
    allowedClasses: ["wizard"],

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
    allowedClasses: ["wizard", "druid"],

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
    allowedClasses: ["wizard", "druid"],

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

  {
    id: "radiant_bolt",

    nameKey: "spell_radiant_bolt",
    descriptionKey: "spell_radiant_bolt_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 15,
    allowedClasses: ["cleric", "paladin"],

    classModifiers: {
      paladin: {
        range: 5,
      },
    },

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

  {
    id: "entangle",
    nameKey: "spell_entangle",
    descriptionKey: "spell_entangle_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 15,

    area: {
      shape: "circle",
      radius: 4,
    },

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 4,
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
    ],

    recovery: "unlimited",

    instance: {
      lifetime: "duration",
      duration: 4,

      effects: [
        {
          trigger: "enter-area",
          effect: {
            type: "apply-condition",
            conditionId: "silenced",
            duration: 1,
          },
        },
        {
          trigger: "turn-start",
          effect: {
            type: "apply-condition",
            conditionId: "silenced",
            duration: 1,
          },
        },

        {
          trigger: "enter-area",
          effect: {
            type: "apply-condition",
            conditionId: "slowed",
            duration: 1,
          },
        },
        {
          trigger: "turn-start",
          effect: {
            type: "apply-condition",
            conditionId: "slowed",
            duration: 1,
          },
        },

        {
          trigger: "move-inside-area",
          effect: {
            type: "damage",
            damage: {
              count: 1,
              sides: 4,
              type: "magic",
            },
          },
        },
      ],
    },

    isSpell: true,
    spellLevel: 1,
    allowedClasses: ["druid"],

    concentration: true,

    imagePath: "/assets/abilities/",
  },

  {
    id: "moonbeam",
    nameKey: "spell_moonbeam",
    descriptionKey: "spell_moonbeam_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 10,

    area: {
      shape: "circle",
      radius: 4,
    },

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
              5: 3,
              9: 4,
            },
          },
        },
      },
      {
        type: "apply-condition",
        conditionId: "sleeping",
        duration: 3,
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,
    allowedClasses: ["druid"],

    concentration: false,

    imagePath: "/assets/abilities/",
  },

  {
    id: "dissonant_whispers",

    nameKey: "spell_dissonant_whispers",
    descriptionKey: "spell_dissonant_whispers_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",
    attackType: "spell",

    range: 10,

    allowedClasses: ["bard"],

    effects: [
      {
        type: "damage",
        damage: {
          count: 3,
          sides: 4,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              5: 4,
              9: 5,
            },
          },
        },
      },
      {
        type: "apply-condition",
        conditionId: "frightened",
        duration: 1,
        stacks: 1,
        value: 0,
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,

    imagePath: "/assets/abilities/",
  },

  {
    id: "vicious_mockery",

    nameKey: "spell_vicious_mockery",
    descriptionKey: "spell_vicious_mockery_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",

    range: 7,

    allowedClasses: ["bard"],

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 15,
          type: "magic",
          scaling: {
            type: "character-level",
            diceCount: {
              9: 2,
            },
          },
        },
      },
      {
        type: "modify-behavior",
        modifier: {
          behavior: "attack-roll",
          operation: "disadvantage",
          trigger: "roll",
          duration: 1,
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

  //UTILITY SPELLS
  //MASTER ONLY
  {
    id: "contact_spirits",

    nameKey: "spell_contact_spirits",
    descriptionKey: "spell_contact_spirits_description",

    actionType: "action",
    targetType: "self",
    targetingMode: "single",

    range: 0,
    allowedClasses: ["cleric", "paladin", "bard"],

    effects: [],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //MASTER ONLY
  {
    id: "detect_magic",

    nameKey: "spell_detect_magic",
    descriptionKey: "spell_detect_magic_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "area",

    range: 15,
    allowedClasses: ["wizard", "cleric", "bard"],

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

  //MASTER ONLY
  {
    id: "telepathy",

    nameKey: "spell_telepathy",
    descriptionKey: "spell_telepathy_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",

    range: 7,
    allowedClasses: ["wizard", "bard"],

    effects: [],

    recovery: "unlimited",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  //MASTER ONLY
  {
    id: "speak_with_animals",
    nameKey: "spell_speak_with_animals",
    descriptionKey: "spell_speak_with_animals_description",

    actionType: "action",
    targetType: "self",
    targetingMode: "single",

    range: 0,
    allowedClasses: ["druid"],

    effects: [],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,

    imagePath: "/assets/abilities/",
  },

  {
    id: "charm_person",

    nameKey: "spell_charm_person",
    descriptionKey: "spell_charm_person_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",

    range: 10,
    concentration: true,

    allowedClasses: ["wizard", "bard", "cleric", "thief"],

    effects: [
      {
        type: "apply-condition",
        conditionId: "charmed",
        duration: 3,
        stacks: 1,
        value: 0,
        targetCreatureType: "humanoid",
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
    id: "longstrider",
    nameKey: "spell_longstrider",
    descriptionKey: "spell_longstrider_description",

    actionType: "action",
    targetType: "self-or-ally",
    targetingMode: "single",

    range: 8,

    effects: [
      {
        type: "modify-behavior",
        modifier: {
          behavior: "movement",
          operation: "add",
          trigger: "turn",
          value: 7,
          amount: 1,
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,
    allowedClasses: ["druid", "fighter", "barbarian", "thief", "ranger"],

    imagePath: "/assets/abilities/",
  },

  {
    id: "bless",

    nameKey: "spell_bless",
    descriptionKey: "spell_bless_description",

    actionType: "action",
    targetType: "ally",
    targetingMode: "single",

    range: 15,
    allowedClasses: ["paladin", "cleric"],

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
    allowedClasses: ["druid", "bard", "cleric", "paladin"],

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
    allowedClasses: ["cleric"],

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
    id: "healing_word",

    nameKey: "spell_healing_word",
    descriptionKey: "spell_healing_word_description",

    actionType: "action",
    targetType: "ally",
    targetingMode: "single",

    range: 10,

    allowedClasses: ["bard"],

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
    concentration: true,

    allowedClasses: [
      "druid",
      "bard",
      "cleric",
      "fighter",
      "barbarian",
      "thief",
    ],
    classModifiers: {
      fighter: {
        range: 1,
      },
      barbarian: {
        range: 1,
      },
    },

    effects: [
      {
        type: "apply-condition",
        conditionId: "frightened",
        duration: 3,
        stacks: 1,
        value: 0,
        targetCreatureType: "humanoid",
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

    concentration: true,

    allowedClasses: ["cleric", "bard"],

    effects: [
      {
        type: "modify-behavior",
        duration: 3,
        modifier: {
          behavior: "damage",
          operation: "add-dice",
          trigger: "spell",
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
    id: "sanctuary",
    nameKey: "spell_sanctuary",
    descriptionKey: "spell_sanctuary_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 10,

    concentration: true,

    allowedClasses: ["cleric", "paladin"],

    classModifiers: {
      cleric: {
        range: 10,
      },
      paladin: {
        range: 1,
      },
    },

    area: {
      shape: "rectangle",
      width: 3,
      height: 3,
    },

    effects: [],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,

    resourceCost: {
      amount: 1,
    },

    instance: {
      lifetime: "duration",
      duration: 3,

      blocksDamage: true,
    },

    imagePath: "/assets/abilities/",
  },

  {
    id: "hunters_mark",

    nameKey: "spell_hunters_mark",
    descriptionKey: "spell_hunters_mark_description",

    actionType: "bonus-action",
    targetType: "enemy",
    targetingMode: "single",

    range: 10,

    allowedClasses: ["ranger"],

    concentration: true,

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
  },

  {
    id: "piercing_shot",

    nameKey: "spell_piercing_shot",
    descriptionKey: "spell_piercing_shot_description",

    actionType: "bonus-action",
    targetType: "self",
    targetingMode: "single",

    allowedClasses: ["ranger"],

    effects: [
      {
        type: "modify-behavior",
        modifier: {
          behavior: "armor-penetration",
          operation: "add",
          trigger: "attack",
          value: 5,
          amount: 1,
        },
      },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },
  },

  {
    id: "second_wind",

    nameKey: "spell_second_wind",
    descriptionKey: "spell_second_wind_description",

    actionType: "bonus-action",
    targetType: "self",
    targetingMode: "single",

    allowedClasses: ["fighter"],

    effects: [
      {
        type: "heal",

        healing: {
          count: 1,
          sides: 10,
        },

        levelScaling: {
          2: { modifier: 2 },
          3: { modifier: 3 },
          4: { modifier: 4 },
          5: { modifier: 5 },
          6: { modifier: 6 },
          7: { modifier: 7 },
          8: { modifier: 8 },
          9: { modifier: 9 },
          10: { modifier: 10 },
          11: { modifier: 11 },
          12: { modifier: 12 },
        },
      },
    ],

    recovery: "short-rest",

    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },
  },

  {
    id: "action_surge",

    nameKey: "spell_action_surge",
    descriptionKey: "spell_action_surge_description",

    actionType: "bonus-action",
    targetType: "self",
    targetingMode: "single",

    allowedClasses: ["fighter"],

    effects: [
      {
        type: "grant-action",
      },
    ],

    recovery: "short-rest",

    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },
  },

  {
    id: "rage",
    nameKey: "spell_rage",
    descriptionKey: "spell_rage_description",
    actionType: "bonus-action",
    targetType: "self",
    targetingMode: "single",
    allowedClasses: ["barbarian"],

    effects: [
      {
        type: "modify-behavior",
        duration: 3,
        modifier: {
          behavior: "damage",
          operation: "add",
          trigger: "attack",
        },
        classDamageScaling: {
          barbarian: {
            levelScaling: {
              1: {
                modifier: 2,
              },
              4: {
                modifier: 3,
              },
              8: {
                modifier: 4,
              },
              12: {
                modifier: 5,
              },
            },
          },
        },
      },
    ],

    recovery: "short-rest",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },
  },

  {
    id: "reckless_attack",
    nameKey: "spell_reckless_attack",
    descriptionKey: "spell_reckless_attack_description",
    actionType: "bonus-action",
    targetType: "self",
    targetingMode: "single",
    allowedClasses: ["barbarian"],

    effects: [
      {
        type: "modify-behavior",
        modifier: {
          behavior: "attack-roll",
          operation: "advantage",
          trigger: "attack",
          amount: 1,
        },
      },
    ],

    recovery: "short-rest",
    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },
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

    allowedClasses: ["wizard", "bard", "cleric", "druid"],

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
      lifetime: "until-disarmed-or-destroyed",
      hp: 10,
      maxHp: 10,
      armor: 1,
      magicResistance: 1,
      disarmable: true,
      disarmDC: 10,
      disarmRange: 1,
    },

    imagePath: "/assets/abilities/",
  },

  // NEEDS FIX
  // VISION / FOG SYSTEM
  {
    id: "fog_cloud",
    nameKey: "spell_fog_cloud",
    descriptionKey: "spell_fog_cloud_description",

    actionType: "action",
    targetType: "location",
    targetingMode: "area",

    range: 15,

    area: {
      shape: "circle",
      radius: 5,
    },

    effects: [],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,
    allowedClasses: ["druid", "ranger"],

    imagePath: "/assets/abilities/",
  },

  // NEEDS FIX
  // VISION / FOG SYSTEM
  {
    id: "smoke_bomb",

    nameKey: "spell_smoke_bomb",
    descriptionKey: "spell_smoke_bomb_description",

    actionType: "bonus-action",
    targetType: "location",
    targetingMode: "area",

    range: 8,

    area: {
      shape: "circle",
      radius: 3,
    },

    effects: [],

    recovery: "cooldown",

    isSpell: true,

    allowedClasses: ["thief"],

    instance: {
      lifetime: "duration",
      duration: 2,
    },

    imagePath: "/assets/abilities/",
  },

  // NEEDS FIX
  //TRANSFORMING
  {
    id: "wild_shape",

    nameKey: "spell_wild_shape",
    descriptionKey: "spell_wild_shape_description",

    actionType: "action",

    targetType: "self",
    targetingMode: "single",

    range: 0,

    allowedClasses: ["druid"],

    effects: [
      //{
      // type: "transform",
      // },
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,

    imagePath: "/assets/abilities/",
  },

  //NEEDS FIX
  //NEEDS DEAD FEATURES
  {
    id: "speak_with_dead",

    nameKey: "spell_speak_with_dead",
    descriptionKey: "spell_speak_with_dead_description",

    actionType: "action",
    targetType: "enemy",
    targetingMode: "single",

    range: 1,
    allowedClasses: ["cleric", "bard", "paladin"],

    effects: [
      /*{
        type: "modify-behavior",
        modifier: {
          behavior: "target",
          operation: "require",
          trigger: "spell",
          targetCreatureState: "dead",
        },
      },*/
    ],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,
    resourceCost: {
      amount: 1,
    },

    imagePath: "/assets/abilities/",
  },

  // NEEDS FIX
  // Creates 5 magical berries that can be consumed to restore HP.
  // Requires item/consumable system.
  {
    id: "goodberry",
    nameKey: "spell_goodberry",
    descriptionKey: "spell_goodberry_description",

    actionType: "action",
    targetType: "self",
    targetingMode: "single",

    range: 0,

    effects: [],

    recovery: "unlimited",

    isSpell: true,
    spellLevel: 1,
    allowedClasses: ["druid"],

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
