import type { AbilityDefinition } from "../Ability";

export const LEVELONESPELLS: AbilityDefinition[] = [
  //COMBAT DEALING DAMAGE SPELLS

  {
    id: "burning_ray",

    nameKey: "burning_ray",
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

    nameKey: "ice_shard",
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
];
