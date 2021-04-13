import {Patch, applyPatches} from 'immer';

export class UndoStack {
  constructor(
    private undoes: Patch[][] = [],
    private redoes: Patch[][] = [],
    private cursor: number = -1,
  ) {}

  get undoAble(): boolean {
    return !!this.undoes?.[this.cursor + 1];
  }

  get redoAble(): boolean {
    return !!this.redoes?.[this.cursor];
  }

  undo<TSource>(source: TSource): TSource {
    if (this.cursor === this.redoes.length - 1) {
      return source;
    }

    this.cursor += 1;

    return applyPatches(source, this.undoes[this.cursor]);
  }

  redo<TSource>(source: TSource): TSource {
    if (this.cursor === -1) {
      return source;
    }

    let nextSource = applyPatches(source, this.redoes[this.cursor]);

    this.cursor -= 1;

    return nextSource;
  }

  update(patches: Patch[], inversePatches: Patch[]): void {
    let size = this.cursor + 1;

    this.undoes.splice(0, size, inversePatches);
    this.redoes.splice(0, size, patches);
    this.cursor = -1;
  }
}
