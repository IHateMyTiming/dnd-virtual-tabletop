export let gridWidth = 30;
export let gridHeight = 30;

export function setGridSize(width: number, height: number): boolean {
  if (width < 5 || height < 5 || width % 5 !== 0 || height % 5 !== 0) {
    return false;
  }

  gridWidth = width;
  gridHeight = height;

  return true;
}
