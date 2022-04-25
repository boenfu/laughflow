import {Dict} from 'tslang';

export * from './procedure';
export * from './operators';
export * from './core';
export * from './utils';

export interface IOutputsEntity<TOutputs = any> {
  outputs?: Dict<TOutputs>;
}

declare global {
  namespace laughflow {
    interface ProcedureExtension extends IOutputsEntity {}

    interface FlowExtension extends IOutputsEntity {}

    interface SingleNodeExtension extends IOutputsEntity {}

    interface BranchesNodeExtension extends IOutputsEntity {}
  }
}
