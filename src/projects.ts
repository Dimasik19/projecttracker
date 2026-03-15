import type { ProjectStatus, Task } from './types';

export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function getProjectProgress(projectId: string, tasks: Task[]): number {
  const relatedTasks = tasks.filter((task) => task.projectId === projectId);
  if (relatedTasks.length === 0) {
    return 0;
  }

  const total = relatedTasks.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(total / relatedTasks.length);
}

export function getStatusLabel(status: ProjectStatus): string {
  switch (status) {
    case 'Development':
      return 'Development';
    case 'Ready':
      return 'Ready';
    case 'Hold':
      return 'Hold';
  }
}
