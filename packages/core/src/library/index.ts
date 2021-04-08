import {Dict} from 'tslang';

export * from './node';
export * from './flow';
export * from './procedure';

interface IOutputsEntity<TOutputs = any> {
  outputs?: Dict<TOutputs>;
}

declare global {
  namespace Magicflow {
    interface ProcedureExtension extends IOutputsEntity {}

    interface FlowExtension extends IOutputsEntity {}

    interface SingleNodeExtension extends IOutputsEntity {}

    interface BranchesNodeExtension extends IOutputsEntity {}
  }
}
