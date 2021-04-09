export interface ClipboardValue<TValue, TOrigin = any> {
  type: 'clip' | 'copy';
  value: TValue;
  origin?: TOrigin;
}

export class Clipboard<TValue, TOrigin = any> {
  constructor(
    private target: ClipboardValue<TValue, TOrigin> | undefined = undefined,
  ) {}

  clip(value: TValue, origin?: TOrigin): void {
    this.setTarget({
      type: 'clip',
      value,
      origin,
    });
  }

  copy(value: TValue, origin?: TOrigin): void {
    this.setTarget({
      type: 'copy',
      value,
      origin,
    });
  }

  paste(): ClipboardValue<TValue, TOrigin> | undefined {
    let target = this.target;

    if (!target) {
      return undefined;
    }

    let {type, value} = target;

    if (type === 'clip') {
      this.clear();
    }

    return {type, value};
  }

  clear(): void {
    this.setTarget(undefined);
  }

  private setTarget(target: ClipboardValue<TValue, TOrigin> | undefined): void {
    this.target = target;
  }
}
