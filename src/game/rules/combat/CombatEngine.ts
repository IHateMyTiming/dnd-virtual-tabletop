import type { CombatState } from "./CombatState";
import { startTurn, getCurrentCombatant } from "./Turn";
import type { Combatant } from "./Combatant";
import type { CombatActionType } from "./Action";
import {
  resolveAttack,
  rollAttackDamage,
  type AttackResult,
  type AttackType,
} from "./Attack";
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
import type { DamageResult } from "./Damage";
import {
  increaseConditionResistance,
  rollConditionResistance,
} from "./EffectResistance";

import { CONDITION_RESISTANCE_CONFIG } from "../condition/ConditionResistance";
import { getOpportunityAttackers } from "./OpportunityAttack";
import { resolveDamage, type DamageExpression } from "./Damage";
import { isInMeleeRange } from "./Engagement";
import { getConditionMovementMultiplier } from "../condition/ConditionMovement";
import { recordObservedAttack } from "../combat/PatternKnowledgeManager";
import type { CharacterStats } from "../stats/Stats";
import type { DefenseChoice } from "./Defense";
import { succeedsPercentage } from "../dice/Dice";
import { getDefenseStats } from "./Defense";
import { applyParry } from "./Parry";
import { getEffectiveArmor } from "../condition/ConditionArmor";
import { getEffectiveMagicResistance } from "../condition/ConditionMagicResistance";
import { getIncomingDamageMultiplier } from "../condition/ConditionDamageModifier";
import { getConditionDodgeMultiplier } from "../condition/ConditionDefense";

interface PendingDefense {
  attackerId: string;
  defenderId: string;
  attack: AttackResult;
  damage: DamageResult;
  attackerStats: CharacterStats;
  defenderStats: CharacterStats;
  defenderHpBefore: number;
  type: AttackType;
}

export class CombatEngine {
  private state: CombatState;
  private readonly random: () => number;
  private pendingDefense: PendingDefense | null = null;
  private lastCombatResult: CombatAttackResult | null = null;

  constructor(state: CombatState, random: () => number = Math.random) {
    this.state = state;
    this.random = random;
  }

  private pendingMovement: {
    combatantId: string;
    position: Position;
    movementCost: number;
  } | null = null;

  public getState(): CombatState {
    return this.state;
  }

  public getCurrentCombatant(): Combatant | undefined {
    return getCurrentCombatant(this.state);
  }

  public getPendingDefense(): PendingDefense | null {
    return this.pendingDefense;
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

  public getLastCombatResult(): CombatAttackResult | null {
    return this.lastCombatResult;
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

      if (!attacker || !attacker.alive) {
        continue;
      }

      const aooResult = this.performOpportunityAttack(attacker, defender);

      this.lastCombatResult = aooResult;
    }

    // If the AOO hit, the defender must choose
    // Dodge or Parry before movement continues.
    if (this.pendingDefense) {
      this.pendingMovement = {
        combatantId: current.id,
        position: { ...position },
        movementCost,
      };

      return true;
    }

    // No defense is required, so movement happens immediately.
    current.position = { ...position };
    current.movementRemaining -= movementCost;

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
      totalResistance > 0 &&
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

    return this.resolveCombatAttack(request, "opportunity");
  }

  private resolveCombatAttack(
    request: CombatAttackRequest,
    resource: "action" | "reaction" | "opportunity",
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

    this.state.patternKnowledge = recordObservedAttack(
      this.state.patternKnowledge,
      defender.id,
      attacker.id,
      defender.stats.intelligence,
    );

    const patternKnowledge = this.state.patternKnowledge[defender.id]?.find(
      (knowledge) => knowledge.targetId === attacker.id,
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
      patternBonus: patternKnowledge?.bonus ?? 0,
    });

    if (resource === "action") {
      attacker.actionAvailable = false;
    } else if (resource === "reaction") {
      attacker.reactionAvailable = false;
    }

    const hpBefore = defender.hp;

    if (!attack.hit) {
      return {
        success: true,
        status: "resolved",
        attackerId: attacker.id,
        defenderId: defender.id,
        attack,
        attackerStats: attacker.stats,
        defenderStats: defender.stats,
        defenderHpBefore: hpBefore,
        defenderHpAfter: hpBefore,
      };
    }

    const attackDamage = rollAttackDamage({
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
      patternBonus: patternKnowledge?.bonus ?? 0,
    });

    this.pendingDefense = {
      attackerId: attacker.id,
      defenderId: defender.id,
      attack,
      damage: attackDamage.damage,
      attackerStats: attacker.stats,
      defenderStats: defender.stats,
      defenderHpBefore: hpBefore,
      type: request.type,
    };

    return {
      success: true,
      status: "awaiting-defense",
      attackerId: attacker.id,
      defenderId: defender.id,
      attack,
      damage: attackDamage.damage,
      attackerStats: attacker.stats,
      defenderStats: defender.stats,
      defenderHpBefore: hpBefore,
      defenderHpAfter: hpBefore,
    };
  }

  public resolveDefense(choice: DefenseChoice): CombatAttackResult {
    const pending = this.pendingDefense;

    if (!pending) {
      return {
        success: false,
        attackerId: "",
        defenderId: "",
      };
    }

    const defender = this.state.combatants.find(
      (combatant) => combatant.id === pending.defenderId,
    );

    if (!defender || !defender.alive) {
      this.pendingDefense = null;

      if (this.pendingMovement) {
        const movingCombatant = this.state.combatants.find(
          (combatant) => combatant.id === this.pendingMovement!.combatantId,
        );

        if (movingCombatant && movingCombatant.alive) {
          movingCombatant.position = {
            ...this.pendingMovement.position,
          };

          movingCombatant.movementRemaining -=
            this.pendingMovement.movementCost;
        }

        this.pendingMovement = null;
      }

      return {
        success: false,
        attackerId: pending.attackerId,
        defenderId: pending.defenderId,
      };
    }

    const defenderConditions = this.state.conditionManager.getConditions(
      defender.id,
    );

    const hpBefore = defender.hp;

    let finalDamage = pending.damage.rawDamage;
    let dodged = false;
    let parried = false;

    if (choice === "dodge") {
      const defenseStats = getDefenseStats(defender.stats);

      const baseDodge =
        pending.type === "spell"
          ? defenseStats.spellDodge
          : defenseStats.physicalDodge;

      const dodgeChance = Math.max(
        0,
        Math.min(
          100,
          baseDodge * getConditionDodgeMultiplier(defenderConditions),
        ),
      );

      const dodgeRoll = this.random() * 100;

      dodged = succeedsPercentage(dodgeChance, dodgeRoll);

      if (dodged) {
        finalDamage = 0;
      }
    }

    if (choice === "parry") {
      if (!defender.reactionAvailable) {
        return {
          success: false,
          attackerId: pending.attackerId,
          defenderId: pending.defenderId,
        };
      }

      defender.reactionAvailable = false;
      parried = true;

      finalDamage = applyParry(defender.stats, finalDamage);
    }

    if (!dodged) {
      if (pending.type === "spell") {
        const effectiveMagicResistance = getEffectiveMagicResistance(
          defender.magicResistance,
          defenderConditions,
        );

        finalDamage = Math.max(
          0,
          finalDamage - Math.max(0, effectiveMagicResistance),
        );
      } else {
        const effectiveArmor = getEffectiveArmor(
          defender.armor,
          defenderConditions,
        );

        finalDamage = Math.max(0, finalDamage - Math.max(0, effectiveArmor));
      }

      const damageMultiplier = getIncomingDamageMultiplier(defenderConditions);

      finalDamage = Math.max(0, finalDamage * damageMultiplier);
    }

    const shouldWake = shouldWakeFromDamage(defenderConditions, finalDamage);

    if (shouldWake) {
      this.state.conditionManager.removeCondition(defender.id, "sleeping");
    }

    defender.hp = Math.max(0, defender.hp - finalDamage);

    defender.alive = defender.hp > 0;

    this.pendingDefense = null;

    if (this.pendingMovement) {
      const movingCombatant = this.state.combatants.find(
        (combatant) => combatant.id === this.pendingMovement!.combatantId,
      );

      if (movingCombatant && movingCombatant.alive) {
        movingCombatant.position = {
          ...this.pendingMovement.position,
        };

        movingCombatant.movementRemaining -= this.pendingMovement.movementCost;
      }

      this.pendingMovement = null;
    }

    return {
      success: true,
      status: "resolved",
      attackerId: pending.attackerId,
      defenderId: pending.defenderId,
      attack: pending.attack,
      damage: {
        ...pending.damage,
        finalDamage,
      },
      parried,
      dodged,
      attackerStats: pending.attackerStats,
      defenderStats: pending.defenderStats,
      defenderHpBefore: hpBefore,
      defenderHpAfter: defender.hp,
    };
  }
}
