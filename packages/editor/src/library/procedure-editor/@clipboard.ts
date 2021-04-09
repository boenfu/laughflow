export interface ClipboardValue<TValue> {
  type: 'clip' | 'copy';
  value: TValue;
}

export class Clipboard<TValue> {
  constructor(private target: ClipboardValue<TValue> | undefined = undefined) {}

  clip(value: TValue): void {
    this.target = {
      type: 'clip',
      value,
    };
  }

  copy(value: TValue): void {
    this.target = {
      type: 'copy',
      value,
    };
  }

  paste(): TValue | undefined {
    let {type, value} = this.target || {};

    if (type === 'clip') {
      this.clear();
    }

    return value;
  }

  clear(): void {
    this.target = undefined;
  }
}
