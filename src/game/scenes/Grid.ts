export let gridWidth = 100;
export let gridHeight = 100;

export const cellSize = 48;

export function setGridSize(width: number, height: number): boolean {
  if (
    width < 5 ||
    height < 5 ||
    width > 100 ||
    height > 100 ||
    width % 5 !== 0 ||
    height % 5 !== 0
  ) {
    return false;
  }

  gridWidth = width;
  gridHeight = height;

  return true;
}
