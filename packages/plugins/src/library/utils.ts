import type {ITaskRuntime} from '@laughflow/task';
import {TaskRuntime} from '@laughflow/task';

import type {IPlugin} from './plugin';

export class TaskPluginRuntime extends TaskRuntime {
  constructor(plugins: IPlugin[]) {
    super(
      plugins
        .map(plugin => plugin.task?.runtime)
        .filter(Boolean) as ITaskRuntime[],
    );
  }
}
