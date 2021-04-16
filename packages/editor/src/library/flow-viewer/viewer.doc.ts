import {Task, TaskMetadata} from '@magicflow/task';

export interface ViewerProps {
  task: Task;
  onChange?(metadata: TaskMetadata): void;
}
