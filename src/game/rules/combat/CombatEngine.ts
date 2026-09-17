import type { CombatState } from "./CombatState";
import { startTurn, getCurrentCombatant } from "./Turn";
import type { Combatant } from "./Combatant";
import type { CombatActionType } from "./Action";
import { roundToOneDecimal } from "../dice/Dice";
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
  canUseAction,
  canUseBonusAction,
  canUseReaction,
  canUseSpecialMovement,
  canAttackTarget,
  createMovementRestrictions,
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
import type { AbilityEffect } from "../abilities/AbilityEffect";
import {
  consumeModifier,
  getModifierValue,
  getModifierMultiplier,
  type CombatModifier,
} from "./CombatModifier";
import { executeAbilityEffects } from "../abilities/AbilityEffectExecutor";
import type { AbilityInstance } from "../abilities/AbilityInstance";
import type { AbilityArea } from "../abilities/Ability";

interface PendingDefense {
  attackerId: string;
  defenderId: string;
  attack: AttackResult;
  damage: DamageResult;
  attackerStats: CharacterStats;
  defenderStats: CharacterStats;
  defenderHpBefore: number;
  type: AttackType;
  abilityId?: string;
  remainingEffects?: AbilityEffect[];
}

export class CombatEngine {
  private state: CombatState;
  private abilityInstances: AbilityInstance[] = [];
  private readonly random: () => number;
  private pendingDefenses: PendingDefense[] = [];
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
    return this.pendingDefenses[0] ?? null;
  }

  public getPendingDefenseCount(): number {
    return this.pendingDefenses.length;
  }

  public startCombat(): void {
    this.state = startTurn(this.state);
  }

  public startTurn(): void {
    this.state = startTurn(this.state);
  }

  endTurn(): void {
    const current = this.getCurrentCombatant();

    if (current) {
      this.processTurnModifierDurations(current);
    }

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

    return this.resolveCombatAttack(request, "action", true);
  }

  public attackMultiple(requests: CombatAttackRequest[]): CombatAttackResult[] {
    if (requests.length === 0) {
      return [];
    }

    const attackerId = requests[0].attackerId;

    if (requests.some((request) => request.attackerId !== attackerId)) {
      return requests.map((request) => ({
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      }));
    }

    const attacker = this.state.combatants.find(
      (combatant) => combatant.id === attackerId,
    );

    if (!attacker || this.getCurrentCombatant()?.id !== attacker.id) {
      return requests.map((request) => ({
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      }));
    }

    const conditions = this.state.conditionManager.getConditions(attacker.id);

    if (!canUseAction(conditions) || !attacker.actionAvailable) {
      return requests.map((request) => ({
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      }));
    }

    attacker.actionAvailable = false;

    return requests.map((request) =>
      this.resolveCombatAttack(request, "action", false),
    );
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
    if (this.pendingDefenses.length > 0) {
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

  public addModifier(combatantId: string, modifier: CombatModifier): void {
    console.log("ADDING MODIFIER:", modifier);
    const combatant = this.state.combatants.find(
      (current) => current.id === combatantId,
    );

    if (!combatant) {
      throw new Error(`Combatant "${combatantId}" not found.`);
    }

    const existingModifier = modifier.id
      ? combatant.modifiers.find((current) => current.id === modifier.id)
      : undefined;

    if (existingModifier) {
      existingModifier.value = modifier.value;
      existingModifier.amount = modifier.amount;
      existingModifier.duration = modifier.duration;
      existingModifier.diceCount = modifier.diceCount;
      existingModifier.diceSides = modifier.diceSides;
      return;
    }

    combatant.modifiers.push({ ...modifier });
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

    let source: Combatant | undefined;

    if (sourceId) {
      source = this.state.combatants.find(
        (combatant) => combatant.id === sourceId,
      );

      if (!source) {
        throw new Error("Condition source must exist.");
      }
    }

    const movementRestrictions =
      (conditionId === "charmed" || conditionId === "frightened") && source
        ? createMovementRestrictions(
            conditionId,
            source.position,
            target.position,
          )
        : undefined;

    const condition = this.state.conditionManager.applyCondition(
      targetId,
      conditionId,
      duration,
      stacks,
      value,
      sourceId,
      movementRestrictions,
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

      const forcedMovementSource = this.state.combatants.find(
        (combatant) => combatant.id === sourceId,
      );

      if (!forcedMovementSource) {
        throw new Error("Forced movement source and target must exist.");
      }

      target.position = calculateForcedMovement(
        target.position,
        forcedMovementSource.position,
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

        combatant.hp = roundToOneDecimal(
          Math.max(0, combatant.hp - damage.totalDamage),
        );
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

    target.hp = roundToOneDecimal(Math.max(0, target.hp - result.finalDamage));
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

    target.hp = roundToOneDecimal(Math.min(target.maxHp, target.hp + amount));
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
      attackerLevel: attacker.level,

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
    resource: "action" | "opportunity",
    consumeAction = false,
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
      attackerLevel: attacker.level,
      attackerModifiers: [
        ...attacker.modifiers,
        ...(request.temporaryModifiers ?? []),
      ],
    });

    this.consumeAttackRollModifiers(attacker);

    if (resource === "action" && consumeAction) {
      attacker.actionAvailable = false;
    }

    const hpBefore = defender.hp;

    if (!attack.hit) {
      this.consumeAttackModifiers(attacker, request.type);
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

    const attackDamage = rollAttackDamage(
      {
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
        attackerLevel: attacker.level,
        attackerModifiers: [
          ...attacker.modifiers,
          ...(request.temporaryModifiers ?? []),
        ],
      },
      {
        casterHealthPercent: (attacker.hp / attacker.maxHp) * 100,
        targetHealthPercent: (defender.hp / defender.maxHp) * 100,
        distance: request.distance,
        turn: this.state.round,
        targetCreatureType: defender.creatureType,
      },
    );

    const damageMultiplier = request.damageMultiplier ?? 1;

    const adjustedDamage: DamageResult = {
      ...attackDamage.damage,
      rawDamage: attackDamage.damage.rawDamage * damageMultiplier,
      finalDamage: attackDamage.damage.finalDamage * damageMultiplier,
    };

    this.consumeAttackModifiers(attacker, request.type);

    const isAllyTarget = attacker.team === defender.team;

    if (isAllyTarget) {
      // Friendly attacks still roll to hit, but the ally never gets
      // a Dodge/Parry reaction.
      this.applyDamageAndEffectsImmediately(
        attacker.id,
        defender.id,
        adjustedDamage,
        request.remainingEffects,
        request.abilityId,
      );

      return {
        success: true,
        status: "resolved",
        attackerId: attacker.id,
        defenderId: defender.id,
        attack,
        damage: adjustedDamage,
        attackerStats: attacker.stats,
        defenderStats: defender.stats,
        defenderHpBefore: hpBefore,
        defenderHpAfter: defender.hp,
      };
    }

    this.pendingDefenses.push({
      attackerId: attacker.id,
      defenderId: defender.id,
      attack,
      damage: adjustedDamage,
      attackerStats: attacker.stats,
      defenderStats: defender.stats,
      defenderHpBefore: hpBefore,
      type: request.type,
      abilityId: request.abilityId,
      remainingEffects: request.remainingEffects,
    });

    return {
      success: true,
      status: "awaiting-defense",
      attackerId: attacker.id,
      defenderId: defender.id,
      attack,
      damage: adjustedDamage,
    };
  }

  public resolveDefense(choice: DefenseChoice): CombatAttackResult {
    const pending = this.pendingDefenses[0];
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
      this.pendingDefenses.shift();
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

      const conditionDodge =
        baseDodge * getConditionDodgeMultiplier(defenderConditions);

      const modifierDodgeBonus = getModifierValue(
        defender.modifiers,
        "defense",
        "add",
        "turn",
      );

      const modifierDodgeMultiplier = getModifierMultiplier(
        defender.modifiers,
        "defense",
        "turn",
      );

      const dodgeChance = Math.max(
        0,
        Math.min(
          100,
          (conditionDodge + modifierDodgeBonus) * modifierDodgeMultiplier,
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
        const conditionMagicResistance = getEffectiveMagicResistance(
          defender.magicResistance,
          defenderConditions,
        );

        const modifierMagicResistanceBonus = getModifierValue(
          defender.modifiers,
          "magic-resistance",
          "add",
          "turn",
        );

        const modifierMagicResistanceMultiplier = getModifierMultiplier(
          defender.modifiers,
          "magic-resistance",
          "turn",
        );

        const effectiveMagicResistance =
          (conditionMagicResistance + modifierMagicResistanceBonus) *
          modifierMagicResistanceMultiplier;

        finalDamage = Math.max(
          0,
          finalDamage - Math.max(0, effectiveMagicResistance),
        );
      } else {
        const conditionArmor = getEffectiveArmor(
          defender.armor,
          defenderConditions,
        );

        const modifierArmorBonus = getModifierValue(
          defender.modifiers,
          "armor",
          "add",
          "turn",
        );

        const modifierArmorMultiplier = getModifierMultiplier(
          defender.modifiers,
          "armor",
          "turn",
        );

        const effectiveArmor =
          (conditionArmor + modifierArmorBonus) * modifierArmorMultiplier;

        finalDamage = Math.max(0, finalDamage - Math.max(0, effectiveArmor));
      }

      const damageMultiplier = getIncomingDamageMultiplier(defenderConditions);

      finalDamage = Math.max(1, finalDamage * damageMultiplier);
    }

    finalDamage = roundToOneDecimal(finalDamage);

    const shouldWake = shouldWakeFromDamage(defenderConditions, finalDamage);

    if (shouldWake) {
      this.state.conditionManager.removeCondition(defender.id, "sleeping");
    }

    defender.hp = roundToOneDecimal(Math.max(0, defender.hp - finalDamage));

    defender.alive = defender.hp > 0;

    if (!dodged && defender.alive && pending.remainingEffects?.length) {
      executeAbilityEffects(
        pending.remainingEffects,
        {
          casterId: pending.attackerId,
          targetId: pending.defenderId,
        },
        this,
        pending.abilityId ?? "",
      );
    }

    this.pendingDefenses.shift();

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

  private applyDamageAndEffectsImmediately(
    attackerId: string,
    defenderId: string,
    damage: DamageResult,
    remainingEffects?: AbilityEffect[],
    abilityId?: string,
  ): void {
    const defender = this.state.combatants.find(
      (combatant) => combatant.id === defenderId,
    );

    if (!defender) {
      return;
    }

    const defenderConditions =
      this.state.conditionManager.getConditions(defenderId);

    const incomingDamageMultiplier =
      getIncomingDamageMultiplier(defenderConditions);

    const finalDamage = roundToOneDecimal(
      Math.max(1, damage.finalDamage * incomingDamageMultiplier),
    );

    const shouldWake = shouldWakeFromDamage(defenderConditions, finalDamage);

    if (shouldWake) {
      this.state.conditionManager.removeCondition(defenderId, "sleeping");
    }

    defender.hp = roundToOneDecimal(Math.max(0, defender.hp - finalDamage));
    defender.alive = defender.hp > 0;

    if (defender.alive && remainingEffects?.length) {
      executeAbilityEffects(
        remainingEffects,
        {
          casterId: attackerId,
          targetId: defenderId,
        },
        this,
        abilityId ?? "",
      );
    }
  }

  private consumeAttackRollModifiers(attacker: Combatant): void {
    const modifiers = [...attacker.modifiers];

    for (const modifier of modifiers) {
      if (
        modifier.trigger === "roll" &&
        modifier.behavior === "attack-roll" &&
        (modifier.amount === undefined || modifier.amount > 0)
      ) {
        consumeModifier(attacker.modifiers, modifier);
      }
    }
  }

  private consumeAttackModifiers(
    attacker: Combatant,
    attackType: AttackType,
  ): void {
    const modifiers = [...attacker.modifiers];

    for (const modifier of modifiers) {
      if (modifier.amount !== undefined && modifier.amount <= 0) {
        continue;
      }

      if (modifier.trigger === "attack") {
        consumeModifier(attacker.modifiers, modifier);

        continue;
      }

      if (modifier.trigger === "spell" && attackType === "spell") {
        consumeModifier(attacker.modifiers, modifier);
      }
    }
  }

  private processTurnModifierDurations(combatant: Combatant): void {
    const modifiers = [...combatant.modifiers];

    for (const modifier of modifiers) {
      if (modifier.duration === undefined) {
        continue;
      }

      modifier.duration -= 1;

      if (modifier.duration <= 0) {
        const index = combatant.modifiers.indexOf(modifier);

        if (index !== -1) {
          combatant.modifiers.splice(index, 1);
        }
      }
    }
  }

  public createAbilityInstance(
    abilityId: string,
    casterId: string,
    position: Position,
    area: AbilityArea,
    options?: {
      hp?: number;
      maxHp?: number;
      duration?: number;
    },
  ): AbilityInstance {
    const instance: AbilityInstance = {
      id: `${abilityId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      abilityId,
      casterId,
      position: { ...position },
      area: { ...area },
      hp: options?.hp,
      maxHp: options?.maxHp,
      duration: options?.duration,
    };

    this.abilityInstances.push(instance);

    return instance;
  }

  public getAbilityInstances(): AbilityInstance[] {
    return this.abilityInstances;
  }

  public getAbilityInstance(instanceId: string): AbilityInstance | undefined {
    return this.abilityInstances.find((instance) => instance.id === instanceId);
  }

  public removeAbilityInstance(instanceId: string): boolean {
    const index = this.abilityInstances.findIndex(
      (instance) => instance.id === instanceId,
    );

    if (index === -1) {
      return false;
    }

    this.abilityInstances.splice(index, 1);
    return true;
  }
}
