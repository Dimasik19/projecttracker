import { createId } from './projects';
import type { Task, TaskProgress } from './types';

export const TASK_PROGRESS_VALUES: TaskProgress[] = [0, 25, 50, 75, 100];

export function createTask(projectId: string, title: string): Task {
  return {
    id: createId('task'),
    projectId,
    title: title.trim(),
    progress: 0,
  };
}
