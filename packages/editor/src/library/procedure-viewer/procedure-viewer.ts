import {IPlugin} from '@magicflow/plugins';
import {
  Procedure,
  ProcedureDefinition,
  ProcedureFlow,
  ProcedureTreeView,
  ProcedureUtil,
} from '@magicflow/procedure';
import {Operator, compose} from '@magicflow/procedure/operators';
import {createEmptyProcedure} from '@magicflow/procedure/utils';
import Eventemitter from 'eventemitter3';
import {enableAllPlugins, produce} from 'immer';

import {NodeRenderDescriptor, buildNodeRenderDescriptor} from '../@common';

enableAllPlugins();

export class ProcedureViewer extends Eventemitter<'update'> {
  private _definition!: ProcedureDefinition;

  private _treeView!: ProcedureTreeView;

  nodeRenderDescriptor: NodeRenderDescriptor = {
    singleNode: {},
    branchesNode: {},
  };

  get definition(): ProcedureDefinition {
    return this._definition;
  }

  set definition(definition: ProcedureDefinition) {
    this._definition = ProcedureUtil.cloneDeep(definition);
    this._treeView = new Procedure(definition).treeView;
    this.emit('update');
  }

  get rootFlow(): ProcedureFlow {
    return this._treeView.root;
  }

  constructor(
    definition: ProcedureDefinition = createEmptyProcedure(),
    plugins: IPlugin[] = [],
  ) {
    super();

    this.definition = definition;
    this.setPlugins(plugins);
  }

  update(operator: Operator): void {
    this.definition = produce(this.definition, compose([operator]));
  }

  private setPlugins(plugins: IPlugin[]): void {
    this.nodeRenderDescriptor = buildNodeRenderDescriptor(plugins, 'viewer');
  }
}
