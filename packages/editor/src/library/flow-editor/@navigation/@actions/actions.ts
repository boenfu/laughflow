import {NodeType} from '@magicflow/procedure';
import {FC} from 'react';

import {ProcedureEditor} from '../../../procedure-editor';

import {branchesNodeActionDefinition} from './@branches';
import {flowActionDefinition} from './@flow';
import {singleNodeActionDefinition} from './@single';

export interface Action {
  type: string;
  icon: FC;
  title: string;
}

export interface ActionDefinition {
  actions: Action[];
  handler(editor: ProcedureEditor, type: string): void;
}

export const actionDefinitionDict: {
  [key in NodeType | 'flow']: ActionDefinition;
} = {
  singleNode: singleNodeActionDefinition,
  branchesNode: branchesNodeActionDefinition,
  flow: flowActionDefinition,
};
