import {FlowId, NodeId} from '@laughflow/procedure';
import {
  OperatorFunction,
  addFlowStart,
  addNodeNexts,
  compose,
  out,
  removeAllFlowStart,
  replaceFlowStart,
} from '@laughflow/procedure/operators';

export const insertNodeAsFlowStart: ({}: {
  flow: FlowId;
  originStart?: NodeId | 'all';
}) => OperatorFunction<[NodeId]> = ({flow, originStart}) => target =>
  compose([
    ...(originStart
      ? originStart === 'all'
        ? [
            out(removeAllFlowStart(flow), starts => [
              addFlowStart(flow, target),
              addNodeNexts(target, starts),
            ]),
          ]
        : [
            replaceFlowStart(flow, originStart, target),
            addNodeNexts(target, [originStart]),
          ]
      : [addFlowStart(flow, target)]),
  ]);
