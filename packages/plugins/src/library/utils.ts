import {ITaskRuntime, TaskRuntime} from '@laughflow/task';

import {IPlugin} from './plugin';

export class TaskPluginRuntime extends TaskRuntime {
  constructor(plugins: IPlugin[]) {
    super(
      plugins
        .map(plugin => plugin.task?.runtime)
        .filter(Boolean) as ITaskRuntime[],
    );
  }
}
