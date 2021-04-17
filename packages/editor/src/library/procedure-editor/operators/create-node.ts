import {NodeId} from '@magicflow/procedure';
import {
  OperatorFunction,
  addFlow,
  addNode as _addNode,
  compose,
} from '@magicflow/procedure/operators';
import {createFlow as createFlowHelper} from '@magicflow/procedure/utils';

export interface CreateFlowOperatorParam {
  node: NodeId;
}

/**
 * 新增 flow
 * @param param0
 * @returns
 */
export const createFlow: OperatorFunction<[CreateFlowOperatorParam]> = ({
  node,
}) => compose([addFlow(node, createFlowHelper())]);
