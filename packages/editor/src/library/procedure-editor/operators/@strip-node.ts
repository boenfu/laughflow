import {FlowId, NodeId, NodeType} from '@magicflow/procedure';
import {
  OperatorFunction,
  addFlowStart,
  addNodeNexts,
  compose,
  out,
  removeFlowStart,
  removeNodeNext,
  removeNodeNexts,
} from '@magicflow/procedure/operators';

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
