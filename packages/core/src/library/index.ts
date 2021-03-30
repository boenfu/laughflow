import {Dict} from 'tslang';

export * from './leaf';
export * from './node';
export * from './flow';
export * from './ref';
export * from './procedure';

interface IFlowEntity<TOutputs = any> {
  outputs?: Dict<TOutputs>;
}

declare global {
  namespace Magicflow {
    interface ProcedureExtension extends IFlowEntity {}

    interface FlowExtension extends IFlowEntity {}

    interface NodeExtension extends IFlowEntity {}

    interface BranchesNodeExtension extends IFlowEntity {}

    interface LeafExtension {}
  }
}
