export interface DiceResult {
  rolls: number[];
  modifier: number;
  total: number;
}

export function rollDie(sides: number): number {
  if (sides < 1 || !Number.isInteger(sides)) {
    throw new Error("Dice must have at least 1 side.");
  }

  return Math.floor(Math.random() * sides) + 1;
}

export function rollDice(
  count: number,
  sides: number,
  modifier = 0,
): DiceResult {
  if (count < 1 || !Number.isInteger(count)) {
    throw new Error("Dice count must be a positive integer.");
  }

  const rolls: number[] = [];

  for (let i = 0; i < count; i++) {
    rolls.push(rollDie(sides));
  }

  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;

  return {
    rolls,
    modifier,
    total,
  };
}

export function rollPercentage(): number {
  return Math.floor(Math.random() * 100) + 1;
}

export function succeedsPercentage(
  chance: number,
  roll = rollPercentage(),
): boolean {
  if (chance <= 0) return false;
  if (chance >= 100) return true;

  return roll <= chance;
}
