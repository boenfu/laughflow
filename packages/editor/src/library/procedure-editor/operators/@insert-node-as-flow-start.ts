import {FlowId, NodeId} from '@magicflow/procedure';
import {
  OperatorFunction,
  addFlowStart,
  addNodeNexts,
  compose,
  replaceFlowStart,
} from '@magicflow/procedure/operators';

export const insertNodeAsFlowStart: ({}: {
  flow: FlowId;
  originStart?: NodeId;
}) => OperatorFunction<[NodeId]> = ({flow, originStart}) => target =>
  compose([
    ...(originStart
      ? [
          replaceFlowStart(flow, originStart, target),
          addNodeNexts(target, [originStart]),
        ]
      : [addFlowStart(flow, target)]),
  ]);
