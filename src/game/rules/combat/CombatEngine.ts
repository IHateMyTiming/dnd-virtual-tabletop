import type { CombatState } from "./CombatState";
import { startTurn, endTurn, getCurrentCombatant } from "./Turn";
import type { Combatant } from "./Combatant";
import type { CombatActionType } from "./Action";
import { resolveAttack } from "./Attack";
import type { CombatAttackRequest, CombatAttackResult } from "./CombatAttack";
import {
  calculateDistance,
  calculateMovementCost,
  type MovementType,
  type Position,
} from "./Movement";

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

  public endTurn(): void {
    this.state = endTurn(this.state);
    this.state = startTurn(this.state);
  }

  public useAction(type: CombatActionType): boolean {
    const currentIndex = this.state.currentTurnIndex;

    const combatant = this.state.combatants[currentIndex];

    if (!combatant || !combatant.alive) {
      return false;
    }

    if (!this.isActionAvailable(type, combatant)) {
      return false;
    }

    this.state = {
      ...this.state,
      combatants: this.state.combatants.map((current, index) => {
        if (index !== currentIndex) {
          return current;
        }

        switch (type) {
          case "action":
            return {
              ...current,
              actionAvailable: false,
            };

          case "bonus-action":
            return {
              ...current,
              bonusActionAvailable: false,
            };

          case "reaction":
            return {
              ...current,
              reactionAvailable: false,
            };
        }
      }),
    };

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

  public move(position: Position, type: MovementType = "walk"): boolean {
    const currentIndex = this.state.currentTurnIndex;

    const combatant = this.state.combatants[currentIndex];

    if (!combatant || !combatant.alive) {
      return false;
    }

    const distance = calculateDistance(combatant.position, position);

    const movementCost = calculateMovementCost(distance, type);

    if (movementCost > combatant.movementRemaining) {
      return false;
    }

    this.state = {
      ...this.state,

      combatants: this.state.combatants.map((current, index) =>
        index === currentIndex
          ? {
              ...current,

              position: {
                ...position,
              },

              movementRemaining: current.movementRemaining - movementCost,
            }
          : current,
      ),
    };

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
}
