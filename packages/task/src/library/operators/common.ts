import type {TaskMetadata} from '../core';

export type Operator<TRet = void> = (
  task: TaskMetadata,
) => TRet extends any[] ? [TaskMetadata, ...TRet] : TaskMetadata;

export type OperatorFunction<TParams extends any[], TRet = void> = (
  ...args: TParams
) => Operator<TRet>;
