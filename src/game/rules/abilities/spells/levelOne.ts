import type { AbilityDefinition } from "../Ability";

export const LEVELONESPELLS: AbilityDefinition[] = [
  //COMBAT DEALING DAMAGE SPELLS WIZARD

  {
    id: "burning_ray",

    nameKey: "spell_burning_ray",
    descriptionKey: "spell_burning_ray_description",

    actionType: "action",
    targetType: "area",

    attackType: "spell",

    range: 17,

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
    attackType: "spell",

    range: 10,
    maxTargets: 1,

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 7,
          type: "magic",
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

  //NEEDS FIX
  {
    id: "hand_pistol_gun",

    nameKey: "spell_hand_pistol_gun",
    descriptionKey: "spell_hand_pistol_gun_description",

    actionType: "action",
    targetType: "enemy",

    attackType: "spell",

    range: 25,
    maxTargets: 3,

    effects: [
      {
        type: "damage",
        damage: {
          count: 1,
          sides: 8,
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
  //NEEDS FIX
  {
    id: "lightning_arc",

    nameKey: "spell_lightning_arc",
    descriptionKey: "spell_lightning_arc_description",

    actionType: "action",
    targetType: "area",
    attackType: "spell",

    range: 15,

    area: {
      shape: "circle",
      radius: 3,
    },

    maxTargets: 3,

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 6,
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

  //NEEDS FIX
  {
    id: "blood_thirster",

    nameKey: "spell_blood_thirster",
    descriptionKey: "spell_blood_thirster_description",

    actionType: "action",
    targetType: "enemy",
    attackType: "spell",

    range: 15,
    maxTargets: 1,

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 8,
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
  //NEEDS FIX
  {
    id: "earth_spike",

    nameKey: "spell_earth_spike",
    descriptionKey: "spell_earth_spike_description",

    actionType: "action",
    targetType: "enemy",
    attackType: "spell",

    range: 12,
    maxTargets: 1,

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 6,
          type: "magic",
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
  //NEEDS FIX
  {
    id: "radiant_bolt",

    nameKey: "spell_radiant_bolt",
    descriptionKey: "spell_radiant_bolt_description",

    actionType: "action",
    targetType: "enemy",
    attackType: "spell",

    range: 15,
    maxTargets: 1,

    effects: [
      {
        type: "damage",
        damage: {
          count: 2,
          sides: 6,
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

  //UTILITY SPELLS WIZARD

  {
    id: "contact_spirits",

    nameKey: "spell_contact_spirits",
    descriptionKey: "spell_contact_spirits_description",

    actionType: "action",
    targetType: "self",

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
    targetType: "area",

    range: 15,

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

    range: 7,

    maxTargets: 1,

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

    range: 1,

    maxTargets: 1,

    effects: [
      {
        type: "apply-condition",
        conditionId: "charmed",
        duration: 0,
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
    id: "alarm",

    nameKey: "spell_alarm",
    descriptionKey: "spell_alarm_description",

    actionType: "action",
    targetType: "area",

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

    imagePath: "/assets/abilities/",
  },
];
