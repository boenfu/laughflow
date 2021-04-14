import {Procedure} from '@magicflow/core';
import {TaskMetadata} from '@magicflow/task';

import {IPlugin} from '../plugin';

export interface ViewerProps {
  definition: Procedure;
  metadata: TaskMetadata;
  plugins?: IPlugin[];
  onChange?(metadata: TaskMetadata): void;
}
