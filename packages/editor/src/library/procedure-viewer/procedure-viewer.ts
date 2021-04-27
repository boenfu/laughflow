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
import {Task, TaskMetadata, TaskRuntime} from '@magicflow/task';
import Eventemitter from 'eventemitter3';
import {enableAllPlugins, produce} from 'immer';
import {compact} from 'lodash-es';

import {NodeRenderDescriptor, buildNodeRenderDescriptor} from '../@common';

enableAllPlugins();

export class ProcedureViewer extends Eventemitter<'update'> {
  private _definition!: ProcedureDefinition;

  private _treeView!: ProcedureTreeView;

  nodeRenderDescriptor: NodeRenderDescriptor = {
    singleNode: {},
    branchesNode: {},
  };

  task: Task | undefined;

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
    task?: TaskMetadata,
  ) {
    super();

    this.definition = definition;
    this.setPlugins(plugins);

    if (task) {
      this.task = new Task(
        new Procedure(definition),
        task,
        new TaskRuntime(compact(plugins.map(plugin => plugin.task))),
      );
    }
  }

  updateProcedure(operator: Operator): void {
    this.definition = produce(this.definition, compose([operator]));
  }

  private setPlugins(plugins: IPlugin[]): void {
    this.nodeRenderDescriptor = buildNodeRenderDescriptor(plugins, 'viewer');
  }
}
