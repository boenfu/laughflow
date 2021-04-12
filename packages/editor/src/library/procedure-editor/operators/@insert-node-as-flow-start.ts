import {FlowId, NodeId} from '@magicflow/core';
import {
  OperatorFunction,
  addFlowStart,
  addNodeNexts,
  compose,
  removeFlowStart,
} from '@magicflow/procedure/operators';

export const insertNodeAsFlowStart: ({}: {
  flow: FlowId;
  originStart?: NodeId;
}) => OperatorFunction<[NodeId]> = ({flow, originStart}) => target =>
  compose([
    addFlowStart(flow, target),
    ...(originStart
      ? [
          removeFlowStart(flow, originStart),
          addNodeNexts(target, [originStart]),
        ]
      : []),
  ]);
