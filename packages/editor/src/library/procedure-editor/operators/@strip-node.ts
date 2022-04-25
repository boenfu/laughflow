import type {FlowId, NodeId, NodeType} from '@laughflow/procedure';
import type {OperatorFunction} from '@laughflow/procedure/operators';
import {
  addFlowStart,
  addNodeNexts,
  compose,
  out,
  removeFlowStart,
  removeNodeNext,
  removeNodeNexts,
} from '@laughflow/procedure/operators';

export const stripNode: OperatorFunction<
  [
    {
      prev:
        | {
            type: NodeType;
            id: NodeId;
          }
        | {
            type: 'flow';
            id: FlowId;
          };
      node: NodeId;
    },
  ]
> = ({prev, node}) =>
  compose([
    out(removeNodeNexts(node), nexts => {
      if (prev.type === 'flow') {
        return [
          removeFlowStart(prev.id, node),
          ...nexts.map(next => addFlowStart(prev.id, next)),
        ];
      }

      return [removeNodeNext(prev.id, node), addNodeNexts(prev.id, nexts)];
    }),
  ]);
