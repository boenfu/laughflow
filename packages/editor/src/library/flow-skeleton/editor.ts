import {IFlow} from './flow-skeleton';

export interface IFlowSkeletonEditor<
  TFlow extends IFlow,
  TNode = TFlow['starts'][number]
> {
  active(source: TFlow | TNode | undefined): void;
  isActive(source: TFlow | TNode): boolean;
}

export abstract class AbstractFlowSkeletonEditor<TFlow extends IFlow>
  implements IFlowSkeletonEditor<TFlow> {
  private activeSource: TFlow | TFlow['starts'][number] | undefined;

  active(source: TFlow | TFlow['starts'][number]): void {
    this.activeSource = source;
  }

  isActive(source: TFlow | TFlow['starts'][number]): boolean {
    return this.activeSource?.id === source.id;
  }
}
