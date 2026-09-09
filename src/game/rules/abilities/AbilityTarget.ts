import type { AbilityDefinition } from "./Ability";
import type { CombatState } from "../combat/CombatState";
import { calculateDistance } from "../combat/Movement";

export interface AbilityTarget {
  id: string;
}

export interface AbilityTargetValidation {
  valid: boolean;
  reason?: string;
}

export function validateAbilityTarget(
  ability: AbilityDefinition,
  casterId: string,
  target: AbilityTarget,
  state: CombatState,
): AbilityTargetValidation {
  const caster = state.combatants.find(
    (combatant) => combatant.id === casterId,
  );

  const targetCombatant = state.combatants.find(
    (combatant) => combatant.id === target.id,
  );

  if (!caster) {
    return {
      valid: false,
      reason: "Caster is invalid.",
    };
  }

  if (!target.id) {
    return {
      valid: false,
      reason: "Target is invalid.",
    };
  }

  if (ability.targetType === "area") {
    return {
      valid: true,
    };
  }

  if (!targetCombatant) {
    return {
      valid: false,
      reason: "Target does not exist.",
    };
  }

  if (
    ability.range !== undefined &&
    !isAbilityInRange(ability, casterId, target.id, state)
  ) {
    return {
      valid: false,
      reason: "Target is out of range.",
    };
  }

  if (!targetCombatant.alive) {
    return {
      valid: false,
      reason: "Target is not alive.",
    };
  }

  switch (ability.targetType) {
    case "self":
      if (target.id !== casterId) {
        return {
          valid: false,
          reason: "Ability can only target the caster.",
        };
      }
      break;

    case "ally":
      if (targetCombatant.team !== caster.team) {
        return {
          valid: false,
          reason: "Target is not an ally.",
        };
      }
      break;

    case "enemy":
      if (targetCombatant.team === caster.team) {
        return {
          valid: false,
          reason: "Target is not an enemy.",
        };
      }
      break;
  }

  return {
    valid: true,
  };
}

export function isAbilityInRange(
  ability: AbilityDefinition,
  casterId: string,
  targetId: string,
  state: CombatState,
): boolean {
  if (ability.range === undefined) {
    return true;
  }

  const caster = state.combatants.find(
    (combatant) => combatant.id === casterId,
  );

  const target = state.combatants.find(
    (combatant) => combatant.id === targetId,
  );

  if (!caster || !target) {
    return false;
  }

  const distance = calculateDistance(caster.position, target.position);

  return distance <= ability.range;
}
