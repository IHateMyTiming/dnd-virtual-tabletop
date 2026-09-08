import type { CombatState } from "./CombatState";
import { startTurn, endTurn, getCurrentCombatant } from "./Turn";
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
  canUseAction,
  canUseBonusAction,
  canUseReaction,
  canUseSpecialMovement,
} from "../condition/ConditionRestrictions";
import { getConditionDamage } from "../condition/ConditionDamage";

export class CombatEngine {
  private state: CombatState;

  constructor(state: CombatState) {
    this.state = state;
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

    const attackerConditions = this.state.conditionManager.getConditions(
      attacker.id,
    );

    if (!attacker.alive || !defender.alive) {
      return {
        success: false,
        attackerId: request.attackerId,
        defenderId: request.defenderId,
      };
    }

    if (this.getCurrentCombatant()?.id !== attacker.id) {
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

    const attack = resolveAttack({
      type: request.type,
      attackerStats: attacker.stats,
      defenderStats: defender.stats,
      distance: request.distance,
      target: request.target,
      damage: request.damage,
      armor: defender.armor,
      attackerConditions,
    });

    this.state = {
      ...this.state,
      combatants: this.state.combatants.map((combatant, index) =>
        index === attackerIndex
          ? {
              ...combatant,
              actionAvailable: false,
            }
          : combatant,
      ),
    };

    const hpBefore = defender.hp;

    if (attack.hit && attack.damage) {
      const hpAfter = Math.max(0, defender.hp - attack.damage.finalDamage);

      this.state = {
        ...this.state,
        combatants: this.state.combatants.map((combatant, index) =>
          index === defenderIndex
            ? {
                ...combatant,
                hp: hpAfter,
                alive: hpAfter > 0,
              }
            : combatant,
        ),
      };

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

  move(position: Position, type: MovementType = "walk"): boolean {
    const current = this.getCurrentCombatant();

    if (!current || !current.alive) {
      return false;
    }

    const conditions = this.state.conditionManager.getConditions(current.id);

    if (!canMove(conditions)) {
      return false;
    }

    if (type !== "walk" && !canUseSpecialMovement(conditions)) {
      return false;
    }

    const distance = calculateDistance(current.position, position);

    const movementCost = calculateMovementCost(distance, type);

    if (movementCost > current.movementRemaining) {
      return false;
    }

    current.position = { ...position };
    current.movementRemaining -= movementCost;

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

  applyCondition(
    targetId: string,
    conditionId: ConditionId,
    duration: number,
    stacks = 1,
  ): ConditionState {
    const target = this.state.combatants.find(
      (combatant) => combatant.id === targetId,
    );

    if (!target || !target.alive) {
      throw new Error("Cannot apply condition to an invalid combatant.");
    }

    return this.state.conditionManager.applyCondition(
      targetId,
      conditionId,
      duration,
      stacks,
    );
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
}
