import type { AbilityDefinition } from "./Ability";
import {
  isAbilityAvailable,
  useAbility,
  type AbilityState,
} from "./AbilityState";
import {
  consumeSpellSlot,
  hasSpellSlot,
  type CharacterResources,
} from "./Resource";
import { validateAbilityTarget, type AbilityTarget } from "./AbilityTarget";
import type { CombatState } from "../combat/CombatState";
import type { CombatEngine } from "../combat/CombatEngine";
import { executeAbilityEffects } from "./AbilityEffectExecutor";
import {
  canUseAction,
  canUseBonusAction,
  canUseReaction,
  canUseSpells,
} from "../condition/ConditionRestrictions";
import type {
  CombatAttackRequest,
  CombatAttackResult,
} from "../combat/CombatAttack";

export interface AbilityUseRequest {
  ability: AbilityDefinition;
  state: AbilityState;
  resources: CharacterResources;
  casterId: string;

  target?: AbilityTarget;
  targets?: AbilityTarget[];

  combatState: CombatState;
  combatEngine: CombatEngine;
}

export interface AbilityUseResult {
  success: boolean;
  abilityId: string;
  abilityState?: AbilityState;
  resources?: CharacterResources;
  reason?: string;
  attackResult?: CombatAttackResult;
  attackResults?: CombatAttackResult[];
}

export function resolveAbility(request: AbilityUseRequest): AbilityUseResult {
  const { ability, state, resources, casterId, combatState, combatEngine } =
    request;

  if (state.abilityId !== ability.id) {
    return {
      success: false,
      abilityId: ability.id,
      reason: "Ability state does not match ability.",
    };
  }

  if (!isAbilityAvailable(ability, state)) {
    return {
      success: false,
      abilityId: ability.id,
      reason: "Ability is not available.",
    };
  }

  const caster = combatState.combatants.find(
    (combatant) => combatant.id === casterId,
  );

  if (!caster) {
    return {
      success: false,
      abilityId: ability.id,
      reason: "Caster not found.",
    };
  }

  const casterConditions = combatState.conditionManager.getConditions(casterId);

  if (ability.isSpell && !canUseSpells(casterConditions)) {
    return {
      success: false,
      abilityId: ability.id,
      reason: "Caster cannot use spells.",
    };
  }

  if (ability.actionType === "action" && !canUseAction(casterConditions)) {
    return {
      success: false,
      abilityId: ability.id,
      reason: "Caster cannot use an action.",
    };
  }

  if (
    ability.actionType === "bonus-action" &&
    !canUseBonusAction(casterConditions)
  ) {
    return {
      success: false,
      abilityId: ability.id,
      reason: "Caster cannot use a bonus action.",
    };
  }

  if (ability.actionType === "reaction" && !canUseReaction(casterConditions)) {
    return {
      success: false,
      abilityId: ability.id,
      reason: "Caster cannot use a reaction.",
    };
  }

  if (ability.resourceCost && ability.isSpell) {
    if (ability.spellLevel === undefined) {
      return {
        success: false,
        abilityId: ability.id,
        reason: "Spell requires a spell level.",
      };
    }

    const { amount } = ability.resourceCost;

    if (!hasSpellSlot(resources, ability.spellLevel, amount)) {
      return {
        success: false,
        abilityId: ability.id,
        reason: `Not enough spell slots of level ${ability.spellLevel} or higher.`,
      };
    }
  }

  const resolvedTargets = resolveAbilityTargets(
    ability,
    casterId,
    request,
    combatState,
  );

  if (!resolvedTargets.success) {
    return {
      success: false,
      abilityId: ability.id,
      reason: resolvedTargets.reason,
    };
  }

  const targets = resolvedTargets.targets;

  const updatedState = useAbility(ability, state);

  let updatedResources = resources;

  if (ability.resourceCost && ability.isSpell) {
    if (ability.spellLevel === undefined) {
      throw new Error("Spell requires a spell level.");
    }

    const { amount } = ability.resourceCost;

    updatedResources = consumeSpellSlot(resources, ability.spellLevel, amount);
  }

  let attackResult: CombatAttackResult | undefined;
  let attackResults: CombatAttackResult[] | undefined;

  if (ability.attackType) {
    const damageEffect = ability.effects.find(
      (effect) => effect.type === "damage",
    );

    if (!damageEffect?.damage) {
      return {
        success: false,
        abilityId: ability.id,
        reason: "Attack ability requires a damage effect.",
      };
    }
    const damage = damageEffect.damage;

    const primaryTarget = request.target;

    const attackRequests: CombatAttackRequest[] = targets.map((target) => {
      const defenderConditions = combatState.conditionManager.getConditions(
        target.id,
      );

      const distanceFromCaster =
        combatEngine.getDistanceBetween(casterId, target.id) ?? 0;

      let damageMultiplier = 1;

      if (
        ability.targetingMode === "area" &&
        ability.area.shape === "circle" &&
        ability.area.radius !== undefined &&
        primaryTarget
      ) {
        const center = combatState.combatants.find(
          (combatant) => combatant.id === primaryTarget.id,
        );

        const targetCombatant = combatState.combatants.find(
          (combatant) => combatant.id === target.id,
        );

        if (center && targetCombatant) {
          const dx = targetCombatant.position.x - center.position.x;

          const dy = targetCombatant.position.y - center.position.y;

          const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

          const falloff = damageEffect.areaDamage?.falloff ?? 0;

          damageMultiplier = Math.max(0, 1 - distanceFromCenter * falloff);
        }
      }

      return {
        attackerId: casterId,
        defenderId: target.id,
        type: ability.attackType!,
        distance: distanceFromCaster,
        target: "body",
        damage,
        attackerConditions: casterConditions,
        defenderConditions,
        attackerLevel: caster.level,
        abilityId: ability.id,
        remainingEffects: ability.effects.filter(
          (effect) => effect.type !== "damage",
        ),
        damageMultiplier,
      };
    });

    if (attackRequests.length === 1) {
      attackResult = combatEngine.attack(attackRequests[0]);

      if (!attackResult.success) {
        return {
          success: false,
          abilityId: ability.id,
          reason: "Attack could not be executed.",
        };
      }
    } else {
      attackResults = combatEngine.attackMultiple(attackRequests);

      if (attackResults.some((result) => !result.success)) {
        return {
          success: false,
          abilityId: ability.id,
          reason: "One or more attacks could not be executed.",
        };
      }
    }
  } else {
    for (const target of targets) {
      executeAbilityEffects(
        ability.effects,
        {
          casterId,
          targetId: target.id,
        },
        combatEngine,
        ability.id,
      );
    }
  }

  return {
    success: true,
    abilityId: ability.id,
    abilityState: updatedState,
    resources: updatedResources,
    attackResult,
    attackResults,
  };
}

function resolveAbilityTargets(
  ability: AbilityDefinition,
  casterId: string,
  request: AbilityUseRequest,
  state: CombatState,
):
  | {
      success: true;
      targets: AbilityTarget[];
    }
  | {
      success: false;
      reason: string;
    } {
  switch (ability.targetingMode) {
    case "single": {
      if (!request.target) {
        return {
          success: false,
          reason: "Ability requires a target.",
        };
      }

      const validation = validateAbilityTarget(
        ability,
        casterId,
        request.target,
        state,
      );

      if (!validation.valid) {
        return {
          success: false,
          reason: validation.reason ?? "Invalid target.",
        };
      }

      return {
        success: true,
        targets: [request.target],
      };
    }

    case "multi": {
      if (!request.targets || request.targets.length === 0) {
        return {
          success: false,
          reason: "Ability requires at least one target.",
        };
      }

      if (request.targets.length > ability.maxTargets) {
        return {
          success: false,
          reason: `Ability can target a maximum of ${ability.maxTargets} targets.`,
        };
      }

      const uniqueTargetIds = new Set(
        request.targets.map((target) => target.id),
      );

      if (uniqueTargetIds.size !== request.targets.length) {
        return {
          success: false,
          reason: "Ability targets must be unique.",
        };
      }

      for (const target of request.targets) {
        const validation = validateAbilityTarget(
          ability,
          casterId,
          target,
          state,
        );

        if (!validation.valid) {
          return {
            success: false,
            reason: validation.reason ?? "Invalid target.",
          };
        }
      }

      return {
        success: true,
        targets: request.targets,
      };
    }

    case "area": {
      return resolveAreaTargets(ability, casterId, request, state);
    }
  }
}

function resolveAreaTargets(
  ability: Extract<AbilityDefinition, { targetingMode: "area" }>,
  casterId: string,
  request: AbilityUseRequest,
  state: CombatState,
):
  | {
      success: true;
      targets: AbilityTarget[];
    }
  | {
      success: false;
      reason: string;
    } {
  if (!request.target) {
    return {
      success: false,
      reason: "Area ability requires a primary target.",
    };
  }

  const caster = state.combatants.find(
    (combatant) => combatant.id === casterId,
  );

  if (!caster) {
    return {
      success: false,
      reason: "Caster not found.",
    };
  }

  const primaryTarget = state.combatants.find(
    (combatant) => combatant.id === request.target!.id,
  );

  if (!primaryTarget || !primaryTarget.alive) {
    return {
      success: false,
      reason: "Primary target is invalid.",
    };
  }

  // The selected target must satisfy the ability's target type.
  if (!isValidPrimaryTarget(ability, caster, primaryTarget)) {
    return {
      success: false,
      reason: "Primary target is invalid for this ability.",
    };
  }

  // The primary target must be within the ability's range.
  if (ability.range !== undefined) {
    const distanceFromCaster = Math.sqrt(
      Math.pow(primaryTarget.position.x - caster.position.x, 2) +
        Math.pow(primaryTarget.position.y - caster.position.y, 2),
    );

    if (distanceFromCaster > ability.range) {
      return {
        success: false,
        reason: "Primary target is out of range.",
      };
    }
  }

  if (ability.area.shape !== "circle") {
    return {
      success: false,
      reason: `Area shape "${ability.area.shape}" is not implemented yet.`,
    };
  }

  if (ability.area.radius === undefined) {
    return {
      success: false,
      reason: "Circle area requires a radius.",
    };
  }

  const radius = ability.area.radius;

  const targets: AbilityTarget[] = [];

  for (const combatant of state.combatants) {
    if (!combatant.alive) {
      continue;
    }

    const dx = combatant.position.x - primaryTarget.position.x;

    const dy = combatant.position.y - primaryTarget.position.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= radius) {
      targets.push({
        id: combatant.id,
      });
    }
  }

  return {
    success: true,
    targets,
  };
}

function isValidPrimaryTarget(
  ability: AbilityDefinition,
  caster: CombatState["combatants"][number],
  target: CombatState["combatants"][number],
): boolean {
  switch (ability.targetType) {
    case "self":
      return target.id === caster.id;

    case "ally":
      return target.team === caster.team;

    case "self-or-ally":
      return target.id === caster.id || target.team === caster.team;

    case "enemy":
      return target.team !== caster.team;
  }
}
