import type {Flow, NodeId} from '@laughflow/procedure';
import type {OperatorFunction} from '@laughflow/procedure/operators';
import {
  addFlow,
  addNode,
  addNode as _addNode,
  out,
} from '@laughflow/procedure/operators';
import {
  createFlow as createFlowHelper,
  createNode,
} from '@laughflow/procedure/utils';

export interface CreateFlowOperatorParam {
  node: NodeId;
  callback?(flow: Flow): void;
}

/**
 * 新增 flow (默认会添加一个节点)
 * @param param0
 * @returns
 */
export const createFlow: OperatorFunction<[CreateFlowOperatorParam]> = ({
  node,
  callback = () => {},
}) =>
  out(addNode(createNode()), flowStart =>
    out(addFlow(node, createFlowHelper({starts: [flowStart.id]})), callback),
  );
