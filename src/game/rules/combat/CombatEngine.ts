import type { CombatState } from "./CombatState";
import { startTurn, getCurrentCombatant } from "./Turn";
import type { Combatant } from "./Combatant";
import type { CombatActionType } from "./Action";
import { resolveAttack } from "./Attack";
import type { CombatAttackRequest, CombatAttackResult } from "./CombatAttack";
import type { ConditionId } from "../condition/Condition";
import type { ConditionState } from "../condition/ConditionState";
import {
  calculateDistance,
  calculateMovementCost,
  type MovementType,
  type Position,
} from "./Movement";
import {
  canMove,
  canMoveTo,
  canAttackTarget,
  canUseAction,
  canUseBonusAction,
  canUseReaction,
  canUseSpecialMovement,
} from "../condition/ConditionRestrictions";
import { getConditionDamage } from "../condition/ConditionDamage";
import { calculateForcedMovement } from "../condition/ConditionForcedMovement";
import { shouldWakeFromDamage } from "../condition/ConditionWake";
import { getTotalConditionResistance } from "../condition/ConditionResistanceResolver";

import {
  increaseConditionResistance,
  rollConditionResistance,
} from "./EffectResistance";

import { CONDITION_RESISTANCE_CONFIG } from "../condition/ConditionResistance";
import { getOpportunityAttackers } from "./OpportunityAttack";
import { resolveDamage, type DamageExpression } from "./Damage";
import { isInMeleeRange } from "./Engagement";
import { getConditionMovementMultiplier } from "../condition/ConditionMovement";
export class CombatEngine {
  private state: CombatState;
  private readonly random: () => number;

  constructor(state: CombatState, random: () => number = Math.random) {
    this.state = state;
    this.random = random;
  }

  public getState(): CombatState {
    return this.state;
  }

  public getCurrentCombatant(): Combatant | undefined {
    return getCurrentCombatant(this.state);
  }

  public startCombat(): void {
    this.state = startTurn(this.state);
  }

  public startTurn(): void {
    this.state = startTurn(this.state);
  }

  endTurn(): void {
    const nextIndex = this.state.currentTurnIndex + 1;

    if (nextIndex >= this.state.combatants.length) {
      this.state.round += 1;
      this.state.currentTurnIndex = 0;

      this.processConditionDamage();
      this.state.conditionManager.processRoundStart();

      this.startTurn();
      return;
    }

    this.state.currentTurnIndex = nextIndex;
    this.startTurn();
  }

  useAction(type: CombatActionType): boolean {
    const current = this.getCurrentCombatant();

    if (!current || !current.alive) {
      return false;
    }

    const conditions = this.state.conditionManager.getConditions(current.id);

    if (type === "action" && !canUseAction(conditions)) {
      return false;
    }

    if (type === "bonus-action" && !canUseBonusAction(conditions)) {
      return false;
    }

    if (type === "reaction" && !canUseReaction(conditions)) {
      return false;
    }

    if (!this.isActionAvailable(type, current)) {
      return false;
    }

    switch (type) {
      case "action":
        current.actionAvailable = false;
        break;

      case "bonus-action":
        current.bonusActionAvailable = false;
        break;

      case "reaction":
        current.reactionAvailable = false;
        break;
    }

    return true;
  }

  private isActionAvailable(
    type: CombatActionType,
    combatant: Combatant,
  ): boolean {
    switch (type) {
      case "action":
        return combatant.actionAvailable;

      case "bonus-action":
        return combatant.bonusActionAvailable;

      case "reaction":
        return combatant.reactionAvailable;
    }
  }

  public attack(request: CombatAttackRequest): CombatAttackResult {
    const attacker = this.state.combatants.find(
      (combatant) => combatant.id === request.attackerId,
    );

    if (!attacker || this.getCurrentCombatant()?.id !== attacker.id) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    const conditions = this.state.conditionManager.getConditions(attacker.id);

    if (!canUseAction(conditions)) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    if (!attacker.actionAvailable) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    return this.resolveCombatAttack(request, "action");
  }

  move(position: Position, type: MovementType = "walk"): boolean {
    const current = this.getCurrentCombatant();

    if (!current || !current.alive) {
      return false;
    }

    const conditions = this.state.conditionManager.getConditions(current.id);

    if (!canMove(conditions)) {
      return false;
    }

    if (
      !canMoveTo(current.position, position, conditions, this.state.combatants)
    ) {
      return false;
    }

    if (type !== "walk" && !canUseSpecialMovement(conditions)) {
      return false;
    }

    const distance = calculateDistance(current.position, position);
    const movementCost = calculateMovementCost(distance, type);

    const movementMultiplier = getConditionMovementMultiplier(conditions);
    const effectiveMovementRemaining =
      current.movementRemaining * movementMultiplier;

    const previousPosition = { ...current.position };

    if (movementCost > effectiveMovementRemaining) {
      return false;
    }

    // Only walking can trigger opportunity attacks.
    const opportunityAttackers =
      type === "walk"
        ? getOpportunityAttackers(
            current,
            previousPosition,
            position,
            this.state.combatants,
          )
        : [];

    current.position = { ...position };
    current.movementRemaining -= movementCost;

    for (const opportunityAttacker of opportunityAttackers) {
      const defender = this.state.combatants.find(
        (combatant) => combatant.id === current.id,
      );

      if (!defender || !defender.alive) {
        break;
      }

      const attacker = this.state.combatants.find(
        (combatant) => combatant.id === opportunityAttacker.id,
      );

      if (!attacker || !attacker.alive || !attacker.reactionAvailable) {
        continue;
      }

      this.performOpportunityAttack(attacker, defender);
    }

    return true;
  }

  public teleport(targetId: string, position: Position): boolean {
    const target = this.state.combatants.find(
      (combatant) => combatant.id === targetId,
    );

    if (!target || !target.alive) {
      return false;
    }

    target.position = { ...position };

    return true;
  }

  public getDistanceBetween(
    firstId: string,
    secondId: string,
  ): number | undefined {
    const first = this.state.combatants.find(
      (combatant) => combatant.id === firstId,
    );

    const second = this.state.combatants.find(
      (combatant) => combatant.id === secondId,
    );

    if (!first || !second) {
      return undefined;
    }

    return calculateDistance(first.position, second.position);
  }

  public applyCondition(
    targetId: string,
    conditionId: ConditionId,
    duration: number,
    stacks = 1,
    value?: number,
    sourceId?: string,
  ): ConditionState | undefined {
    const target = this.state.combatants.find(
      (combatant) => combatant.id === targetId,
    );

    if (!target || !target.alive) {
      throw new Error("Cannot apply condition to an invalid combatant.");
    }

    const resistanceState = this.state.conditionManager.getConditionResistance(
      targetId,
      conditionId,
    );

    const totalResistance = getTotalConditionResistance(
      target.stats,
      conditionId,
      resistanceState,
    );

    if (
      resistanceState.resistance > 0 &&
      rollConditionResistance(
        {
          ...resistanceState,
          resistance: totalResistance,
        },
        this.random,
      )
    ) {
      return undefined;
    }

    const condition = this.state.conditionManager.applyCondition(
      targetId,
      conditionId,
      duration,
      stacks,
      value,
      sourceId,
    );

    const updatedResistance = increaseConditionResistance(
      resistanceState,
      CONDITION_RESISTANCE_CONFIG.applicationResistanceIncrease,
    );

    this.state.conditionManager.setConditionResistance(
      targetId,
      updatedResistance,
    );

    if (conditionId === "pulled" || conditionId === "pushed") {
      if (!sourceId) {
        throw new Error("Forced movement conditions require a source.");
      }

      const source = this.state.combatants.find(
        (combatant) => combatant.id === sourceId,
      );

      if (!source) {
        throw new Error("Forced movement source and target must exist.");
      }

      target.position = calculateForcedMovement(
        target.position,
        source.position,
        condition,
      );
    }

    return condition;
  }

  removeCondition(targetId: string, conditionId: ConditionId): boolean {
    return this.state.conditionManager.removeCondition(targetId, conditionId);
  }

  hasCondition(targetId: string, conditionId: ConditionId): boolean {
    return this.state.conditionManager.hasCondition(targetId, conditionId);
  }

  getConditions(targetId: string): ConditionState[] {
    return this.state.conditionManager.getConditions(targetId);
  }

  getCondition(
    targetId: string,
    conditionId: ConditionId,
  ): ConditionState | undefined {
    return this.state.conditionManager.getCondition(targetId, conditionId);
  }

  private processConditionDamage(): void {
    const allConditions = this.state.conditionManager.getAllConditions();

    for (const [targetId, conditions] of allConditions) {
      const combatant = this.state.combatants.find(
        (current) => current.id === targetId,
      );

      if (!combatant || !combatant.alive) {
        continue;
      }

      for (const condition of conditions) {
        const damage = getConditionDamage(condition);

        if (!damage) {
          continue;
        }

        combatant.hp = Math.max(0, combatant.hp - damage.totalDamage);

        if (combatant.hp === 0) {
          combatant.alive = false;
        }
      }
    }
  }

  public getOpportunityAttackersForMove(
    position: Position,
    type: MovementType = "walk",
  ): Combatant[] {
    const current = this.getCurrentCombatant();

    if (!current || !current.alive || type !== "walk") {
      return [];
    }

    return getOpportunityAttackers(
      current,
      current.position,
      position,
      this.state.combatants,
    );
  }

  public damage(targetId: string, expression: DamageExpression): number {
    const target = this.state.combatants.find(
      (combatant) => combatant.id === targetId,
    );

    if (!target || !target.alive) {
      return 0;
    }

    const conditions = this.state.conditionManager.getConditions(target.id);

    const result = resolveDamage(
      expression,
      target.armor,
      target.magicResistance,
      target.stats,
      conditions,
    );

    const hpBefore = target.hp;

    target.hp = Math.max(0, target.hp - result.finalDamage);

    if (target.hp === 0) {
      target.alive = false;
    }

    if (shouldWakeFromDamage(conditions, result.finalDamage)) {
      this.state.conditionManager.removeCondition(target.id, "sleeping");
    }

    return hpBefore - target.hp;
  }

  public heal(targetId: string, amount: number): number {
    const target = this.state.combatants.find(
      (combatant) => combatant.id === targetId,
    );

    if (!target || !target.alive || amount <= 0) {
      return 0;
    }

    const conditions = this.state.conditionManager.getConditions(targetId);

    // Cursed completely prevents healing.
    if (conditions.some((condition) => condition.id === "cursed")) {
      return 0;
    }

    // Bleeding reduces healing by 50%.
    if (conditions.some((condition) => condition.id === "bleeding")) {
      amount = Math.floor(amount * 0.5);
    }

    if (amount <= 0) {
      return 0;
    }

    const hpBefore = target.hp;

    target.hp = Math.min(target.maxHp, target.hp + amount);

    return target.hp - hpBefore;
  }

  private performOpportunityAttack(
    attacker: Combatant,
    defender: Combatant,
  ): CombatAttackResult {
    const distance = calculateDistance(attacker.position, defender.position);

    const request: CombatAttackRequest = {
      attackerId: attacker.id,
      defenderId: defender.id,
      type: "melee",
      distance,
      target: "body",

      // Temporary until equipment provides the weapon attack.
      damage: {
        count: 1,
        sides: 8,
        type: "physical",
      },

      attackerConditions: this.state.conditionManager.getConditions(
        attacker.id,
      ),

      defenderConditions: this.state.conditionManager.getConditions(
        defender.id,
      ),
    };

    return this.resolveCombatAttack(request, "reaction");
  }

  private resolveCombatAttack(
    request: CombatAttackRequest,
    resource: "action" | "reaction",
  ): CombatAttackResult {
    const attackerIndex = this.state.combatants.findIndex(
      (combatant) => combatant.id === request.attackerId,
    );

    const defenderIndex = this.state.combatants.findIndex(
      (combatant) => combatant.id === request.defenderId,
    );

    if (attackerIndex === -1 || defenderIndex === -1) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    const attacker = this.state.combatants[attackerIndex];
    const defender = this.state.combatants[defenderIndex];

    if (!attacker.alive || !defender.alive) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    if (
      request.type === "melee" &&
      !isInMeleeRange(attacker.position, defender.position)
    ) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    const attackerConditions = this.state.conditionManager.getConditions(
      attacker.id,
    );

    if (!canAttackTarget(defender.id, attackerConditions)) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    const defenderConditions = this.state.conditionManager.getConditions(
      defender.id,
    );

    const attack = resolveAttack({
      attackerId: attacker.id,
      defenderId: defender.id,
      type: request.type,
      attackerStats: attacker.stats,
      defenderStats: defender.stats,
      distance: request.distance,
      target: request.target,
      damage: request.damage,
      armor: defender.armor,
      magicResistance: defender.magicResistance,
      attackerConditions,
      defenderConditions,
    });

    if (resource === "action") {
      attacker.actionAvailable = false;
    } else {
      attacker.reactionAvailable = false;
    }

    const hpBefore = defender.hp;

    if (attack.hit && attack.damage) {
      const hpAfter = Math.max(0, defender.hp - attack.damage.finalDamage);

      const shouldWake = shouldWakeFromDamage(
        defenderConditions,
        attack.damage.finalDamage,
      );

      if (shouldWake) {
        this.state.conditionManager.removeCondition(defender.id, "sleeping");
      }

      defender.hp = hpAfter;
      defender.alive = hpAfter > 0;

      return {
        success: true,
        attackerId: attacker.id,
        defenderId: defender.id,
        attack,
        attackerStats: attacker.stats,
        defenderStats: defender.stats,
        defenderHpBefore: hpBefore,
        defenderHpAfter: hpAfter,
      };
    }

    return {
      success: true,
      attackerId: attacker.id,
      defenderId: defender.id,
      attack,
      attackerStats: attacker.stats,
      defenderStats: defender.stats,
      defenderHpBefore: hpBefore,
      defenderHpAfter: hpBefore,
    };
  }
}
