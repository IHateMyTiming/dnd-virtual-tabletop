export interface MapSnapshot<TTerrain, TObject, TCharacter> {
  terrains: TTerrain[];
  objects: TObject[];
  characters: TCharacter[];
}

export class MapHistory<TTerrain, TObject, TCharacter> {
  private undoStack: MapSnapshot<TTerrain, TObject, TCharacter>[] = [];
  private redoStack: MapSnapshot<TTerrain, TObject, TCharacter>[] = [];

  push(snapshot: MapSnapshot<TTerrain, TObject, TCharacter>): void {
    this.undoStack.push(snapshot);
    this.redoStack = [];
  }

  undo(
    current: MapSnapshot<TTerrain, TObject, TCharacter>,
  ): MapSnapshot<TTerrain, TObject, TCharacter> | null {
    const snapshot = this.undoStack.pop();

    if (!snapshot) {
      return null;
    }

    this.redoStack.push(current);
    return snapshot;
  }

  redo(
    current: MapSnapshot<TTerrain, TObject, TCharacter>,
  ): MapSnapshot<TTerrain, TObject, TCharacter> | null {
    const snapshot = this.redoStack.pop();

    if (!snapshot) {
      return null;
    }

    this.undoStack.push(current);
    return snapshot;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
