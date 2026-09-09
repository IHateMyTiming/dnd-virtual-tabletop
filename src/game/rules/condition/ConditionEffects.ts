import type { ConditionId } from "./Condition";
import type { ConditionEffect } from "./ConditionEffect";

export function getConditionEffects(
  conditionId: ConditionId,
): ConditionEffect[] {
  switch (conditionId) {
    case "stunned":
      return [
        {
          type: "incapacitate",
        },
      ];

    case "poisoned":
      return [
        {
          type: "damage-over-time",
        },
      ];

    case "burning":
      return [
        {
          type: "damage-over-time",
        },
      ];

    case "acid":
      return [
        {
          type: "damage-over-time",
        },
      ];

    case "bleeding":
      return [
        {
          type: "damage-over-time",
        },
      ];

    case "slowed":
      return [
        {
          type: "movement-modifier",
        },
      ];

    case "freezed":
      return [
        {
          type: "movement-modifier",
        },
        {
          type: "special-movement-restriction",
        },
        {
          type: "incapacitate",
          value: 1,
        },
      ];

    case "blinded":
      return [
        {
          type: "attack-accuracy-modifier",
        },
        {
          type: "dodge-modifier",
        },
      ];

    case "charmed":
      return [
        {
          type: "attack-target-restriction",
        },
        {
          type: "movement-direction-restriction",
        },
      ];

    case "cursed":
      return [
        {
          type: "incoming-damage-modifier",
        },
        {
          type: "healing-restriction",
        },
      ];

    case "frightened":
      return [
        {
          type: "damage-modifier",
        },
        {
          type: "movement-direction-restriction",
        },
      ];

    case "petrified":
      return [
        {
          type: "incapacitate",
        },
        {
          type: "incoming-damage-modifier",
        },
      ];

    case "sleeping":
      return [
        {
          type: "incapacitate",
        },
      ];

    case "rooted":
      return [
        {
          type: "movement-restriction",
        },
      ];

    case "suppressed":
      return [
        {
          type: "movement-restriction",
        },
        {
          type: "spell-restriction",
        },
      ];

    case "silenced":
      return [
        {
          type: "spell-restriction",
        },
      ];
    case "freezed":
      return [
        {
          type: "movement-modifier",
        },
        {
          type: "special-movement-restriction",
        },
        {
          type: "bonus-action-restriction",
        },
      ];
    case "marked":
      return [
        {
          type: "incoming-damage-modifier",
          value: 1.25,
        },
      ];

    case "armor-penetration":
      return [
        {
          type: "armor-modifier",
          value: -10,
        },
      ];

    case "magic-penetration":
      return [
        {
          type: "magic-resistance-modifier",
          value: -10,
        },
      ];

    case "pulled":
      return [
        {
          type: "forced-movement",
          value: -1,
        },
      ];

    case "pushed":
      return [
        {
          type: "forced-movement",
          value: 1,
        },
      ];
  }
}
